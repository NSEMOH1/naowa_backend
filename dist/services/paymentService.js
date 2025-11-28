"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processLoanRepayment = exports.processPayment = exports.verifyPaystackTransaction = exports.createPaymentIntent = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const axios_1 = __importDefault(require("axios"));
const PAYSTACK_BASE_URL = "https://api.paystack.co";
const createPaymentIntent = async (data) => {
    const { memberId, paymentType, amount, loanId } = data;
    const member = await database_1.prisma.member.findUnique({
        where: { id: memberId },
        include: {
            balance: true,
            loans: {
                where: { status: "ACTIVE" },
                orderBy: { createdAt: "desc" },
            },
        },
    });
    if (!member) {
        throw new Error("Member not found");
    }
    if (paymentType === "LOAN_REPAYMENT") {
        const activeLoan = loanId
            ? member.loans.find((l) => l.id === loanId)
            : member.loans[0];
        if (!activeLoan) {
            throw new Error("No active loan found");
        }
        const loanBalance = member.balance?.loan_balance || 0;
        if (Number(loanBalance) <= 0) {
            throw new Error("No outstanding loan balance");
        }
    }
    const reference = `PAY_${Date.now()}_${memberId.slice(0, 8)}`;
    const metadata = {
        memberId,
        paymentType,
    };
    if (loanId) {
        metadata.loanId = loanId;
    }
    const response = await axios_1.default.post(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        email: member.email,
        amount: amount * 100,
        reference,
        currency: "NGN",
        metadata,
        callback_url: `${process.env.FRONTEND_URL}/payments/verify`,
    }, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
        },
    });
    if (!response.data.status) {
        throw new Error("Failed to initialize payment with Paystack");
    }
    return {
        reference,
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
    };
};
exports.createPaymentIntent = createPaymentIntent;
const verifyPaystackTransaction = async (reference, memberId) => {
    try {
        const response = await axios_1.default.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });
        if (!response.data.status) {
            throw new Error("Payment verification failed");
        }
        const transaction = response.data.data;
        if (transaction.status !== "success") {
            throw new Error("Payment was not successful");
        }
        if (transaction.metadata.memberId !== memberId) {
            throw new Error("Payment member mismatch");
        }
        const result = await (0, exports.processPayment)({
            reference,
            amount: transaction.amount / 100,
            metadata: transaction.metadata,
        });
        return result;
    }
    catch (error) {
        console.error("Verification error:", error);
        throw error;
    }
};
exports.verifyPaystackTransaction = verifyPaystackTransaction;
const processPayment = async (data) => {
    const { reference, amount, metadata } = data;
    const { memberId, paymentType, loanId } = metadata;
    const existingTransaction = await database_1.prisma.transaction.findFirst({
        where: { reference },
    });
    if (existingTransaction) {
        return {
            success: true,
            message: "Payment already processed",
            transaction: existingTransaction,
        };
    }
    if (paymentType === "SAVINGS_DEPOSIT") {
        return await processSavingsDeposit(memberId, amount, reference);
    }
    else if (paymentType === "LOAN_REPAYMENT") {
        return await (0, exports.processLoanRepayment)(memberId, amount, reference, loanId);
    }
    throw new Error("Invalid payment type");
};
exports.processPayment = processPayment;
const processSavingsDeposit = async (memberId, amount, reference) => {
    return await database_1.prisma.$transaction(async (tx) => {
        const savingsCategory = await tx.savingCategory.findFirst({
            where: { type: client_1.SavingType.QUICK },
        });
        if (!savingsCategory) {
            throw new Error("Quick savings category not found");
        }
        const saving = await tx.saving.create({
            data: {
                memberId,
                categoryId: savingsCategory.id,
                amount,
                reference,
                status: client_1.SavingStatus.COMPLETED,
            },
        });
        const transaction = await tx.transaction.create({
            data: {
                memberId,
                savingId: saving.id,
                amount,
                type: client_1.TransactionType.SAVINGS_DEPOSIT,
                description: `Quick savings deposit via Paystack`,
                reference,
                status: client_1.TransactionStatus.COMPLETED,
            },
        });
        const currentBalance = await tx.balances.findUnique({
            where: { memberId },
        });
        if (currentBalance) {
            await tx.balances.update({
                where: { memberId },
                data: {
                    savings_balance: {
                        increment: amount,
                    },
                },
            });
        }
        else {
            await tx.balances.create({
                data: {
                    memberId,
                    savings_balance: amount,
                    loan_balance: 0,
                },
            });
        }
        await tx.notification.create({
            data: {
                memberId,
                title: "Savings Deposit Successful",
                message: `Your quick savings deposit of ₦${amount.toLocaleString()} has been completed successfully.`,
                type: "SUCCESS",
                actionType: "SAVINGS_DEPOSIT",
                actionId: saving.id,
            },
        });
        return {
            success: true,
            message: "Savings deposit processed successfully",
            transaction,
            saving,
        };
    });
};
const processLoanRepayment = async (memberId, amount, reference, loanId) => {
    return await database_1.prisma.$transaction(async (tx) => {
        const loan = loanId
            ? await tx.loan.findUnique({
                where: { id: loanId, memberId },
            })
            : await tx.loan.findFirst({
                where: {
                    memberId,
                    status: "ACTIVE",
                },
                orderBy: { createdAt: "desc" },
            });
        if (!loan) {
            throw new Error("No active loan found for repayment");
        }
        const transaction = await tx.transaction.create({
            data: {
                memberId,
                loanId: loan.id,
                amount,
                type: client_1.TransactionType.LOAN_REPAYMENT,
                description: `Loan repayment via Paystack`,
                reference,
                status: client_1.TransactionStatus.COMPLETED,
            },
        });
        const currentBalance = await tx.balances.findUnique({
            where: { memberId },
        });
        if (!currentBalance) {
            throw new Error("Member balance not found");
        }
        const newLoanBalance = Number(currentBalance.loan_balance) - amount;
        await tx.balances.update({
            where: { memberId },
            data: {
                loan_balance: Math.max(0, newLoanBalance),
            },
        });
        const pendingRepayments = await tx.repayment.findMany({
            where: {
                loanId: loan.id,
                status: "PENDING",
            },
            orderBy: { dueDate: "asc" },
        });
        let remainingAmount = amount;
        const paidRepayments = [];
        for (const repayment of pendingRepayments) {
            if (remainingAmount <= 0)
                break;
            const repaymentAmount = Number(repayment.amount);
            if (remainingAmount >= repaymentAmount) {
                await tx.repayment.update({
                    where: { id: repayment.id },
                    data: {
                        status: "PAID",
                        paidAt: new Date(),
                    },
                });
                remainingAmount -= repaymentAmount;
                paidRepayments.push(repayment.id);
            }
            else {
                // Partial payment - you might want to handle this differently
                // For now, we'll leave it pending
                break;
            }
        }
        const allRepayments = await tx.repayment.findMany({
            where: { loanId: loan.id },
        });
        const allPaid = allRepayments.every((r) => r.status === "PAID");
        const balanceIsZero = newLoanBalance <= 0;
        let completionResult = null;
        if (allPaid && balanceIsZero) {
            const completedLoan = await tx.loan.update({
                where: { id: loan.id },
                data: {
                    status: "COMPLETED",
                    updatedAt: new Date(),
                },
            });
            const totalPaid = allRepayments.reduce((sum, r) => sum + Number(r.amount), 0);
            await tx.transaction.create({
                data: {
                    memberId,
                    loanId: loan.id,
                    type: client_1.TransactionType.ADJUSTMENT,
                    amount: 0,
                    status: client_1.TransactionStatus.COMPLETED,
                    description: `Loan fully paid and completed`,
                    reference: `COMPLETE_${loan.reference}`,
                },
            });
            await tx.notification.create({
                data: {
                    memberId,
                    title: "🎉 Loan Completed!",
                    message: `Congratulations! You have fully paid your loan of ₦${Number(loan.approvedAmount).toLocaleString()}. Total repaid: ₦${totalPaid.toLocaleString()}. You're now eligible to apply for a new loan!`,
                    type: "SUCCESS",
                    actionType: "LOAN_COMPLETED",
                    actionId: loan.id,
                    metadata: {
                        loanReference: loan.reference,
                        principal: Number(loan.approvedAmount),
                        totalPaid,
                        interest: totalPaid - Number(loan.approvedAmount),
                    },
                },
            });
            completionResult = {
                loanCompleted: true,
                totalPaid,
                interest: totalPaid - Number(loan.approvedAmount),
            };
        }
        else {
            await tx.notification.create({
                data: {
                    memberId,
                    title: "Loan Repayment Successful",
                    message: `Your loan repayment of ₦${amount.toLocaleString()} has been processed successfully. ${balanceIsZero
                        ? "Your loan is now fully paid!"
                        : `Remaining balance: ₦${Math.max(0, newLoanBalance).toLocaleString()}`}`,
                    type: "SUCCESS",
                    actionType: "LOAN_REPAYMENT",
                    actionId: loan.id,
                },
            });
            completionResult = {
                loanCompleted: false,
                remainingBalance: Math.max(0, newLoanBalance),
            };
        }
        return {
            success: true,
            message: completionResult.loanCompleted
                ? "Loan repayment processed and loan completed!"
                : "Loan repayment processed successfully",
            transaction,
            paidRepaymentsCount: paidRepayments.length,
            ...completionResult,
        };
    });
};
exports.processLoanRepayment = processLoanRepayment;
//# sourceMappingURL=paymentService.js.map