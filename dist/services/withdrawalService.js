"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelWithdrawal = exports.getWithdrawalByReference = exports.getPendingWithdrawals = exports.getMemberWithdrawals = exports.rejectWithdrawal = exports.approveWithdrawal = exports.requestWithdrawal = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
const password_1 = require("../utils/password");
const functions_1 = require("../utils/functions");
const getMemberTotalSavings = async (memberId) => {
    const balance = await database_1.prisma.balances.findUnique({
        where: { memberId },
        select: { savings_balance: true },
    });
    return new decimal_js_1.default(balance?.savings_balance || 0);
};
const getMemberPendingWithdrawals = async (memberId) => {
    const pendingWithdrawals = await database_1.prisma.withdrawal.aggregate({
        where: {
            memberId,
            status: client_1.WithdrawalStatus.PENDING,
        },
        _sum: {
            amount: true,
        },
    });
    return new decimal_js_1.default(pendingWithdrawals._sum.amount || 0);
};
const requestWithdrawal = async (data) => {
    const validCategories = ["QUICK", "COOPERATIVE"];
    if (!validCategories.includes(data.category_name)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
    }
    const category = await database_1.prisma.savingCategory.findUnique({
        where: { type: data.category_name },
    });
    if (!category)
        throw new Error("Savings Category doesn't exist");
    if (category.name === "COOPERATIVE") {
        throw new Error("You cannot withdraw from COOPERATIVE savings. Please contact the Admin for more information");
    }
    const member = await database_1.prisma.member.findUnique({
        where: { id: data.memberId },
        select: {
            id: true,
            pin: true,
            full_name: true,
            email: true,
        },
    });
    if (!member)
        throw new Error("Member doesn't exist");
    const isPinValid = await (0, password_1.comparePin)(data.pin, member.pin);
    if (!isPinValid)
        throw new Error("Invalid PIN");
    const amount = new decimal_js_1.default(data.amount);
    const zero = new decimal_js_1.default(0);
    if (amount.lte(zero)) {
        throw new Error("Amount must be greater than zero");
    }
    const totalSavings = await getMemberTotalSavings(member.id);
    const pendingWithdrawals = await getMemberPendingWithdrawals(member.id);
    const availableBalance = totalSavings.sub(pendingWithdrawals);
    if (totalSavings.lte(zero)) {
        throw new Error("You have no savings to withdraw");
    }
    if (amount.gt(totalSavings)) {
        throw new Error(`Insufficient savings balance. You have ₦${totalSavings.toFixed(2)} in total savings`);
    }
    if (amount.gt(availableBalance)) {
        throw new Error(`Insufficient available balance. You have ₦${availableBalance.toFixed(2)} available ` + `(₦${pendingWithdrawals.toFixed(2)} pending approval)`);
    }
    const withdrawal = await database_1.prisma.withdrawal.create({
        data: {
            memberId: data.memberId,
            categoryId: category.id,
            amount: amount,
            reference: (0, functions_1.generateWithdrawalReference)(),
            status: client_1.WithdrawalStatus.PENDING,
            reason: data.reason,
            requestedAt: new Date(),
        },
        include: {
            member: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                },
            },
        },
    });
    await database_1.prisma.transaction.create({
        data: {
            memberId: withdrawal.memberId,
            amount: amount.toNumber(),
            type: client_1.TransactionType.SAVINGS_WITHDRAWAL,
            reference: withdrawal.reference,
            description: `Savings withdrawal from ${withdrawal.category.name}`,
            status: client_1.SavingStatus.PENDING,
        },
    });
    // TODO: Send notification to admins about new withdrawal request
    // TODO: Send confirmation email/SMS to member
    return withdrawal;
};
exports.requestWithdrawal = requestWithdrawal;
const approveWithdrawal = async (data) => {
    const withdrawal = await database_1.prisma.withdrawal.findUnique({
        where: { id: data.withdrawalId },
        include: {
            member: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                },
            },
        },
    });
    if (!withdrawal)
        throw new Error("Withdrawal request not found");
    if (withdrawal.status !== client_1.WithdrawalStatus.PENDING) {
        throw new Error(`Cannot approve withdrawal. Current status: ${withdrawal.status}`);
    }
    const amount = new decimal_js_1.default(withdrawal.amount);
    const totalSavings = await getMemberTotalSavings(withdrawal.memberId);
    if (totalSavings.lt(amount)) {
        throw new Error("Insufficient savings balance. Member may have made other withdrawals.");
    }
    const result = await database_1.prisma.$transaction(async (tx) => {
        const approvedWithdrawal = await tx.withdrawal.update({
            where: { id: data.withdrawalId },
            data: {
                status: client_1.WithdrawalStatus.APPROVED,
                approvedAt: new Date(),
                approvedBy: data.approvedBy,
            },
            include: {
                member: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        });
        await tx.saving.create({
            data: {
                memberId: withdrawal.memberId,
                categoryId: withdrawal.categoryId,
                amount: amount.negated(),
                reference: withdrawal.reference,
                status: client_1.SavingStatus.COMPLETED,
            },
        });
        await tx.transaction.updateMany({
            where: {
                reference: withdrawal.reference,
                type: client_1.TransactionType.SAVINGS_WITHDRAWAL,
            },
            data: {
                status: client_1.SavingStatus.COMPLETED,
            },
        });
        await tx.balances.update({
            where: { memberId: withdrawal.memberId },
            data: {
                savings_balance: {
                    decrement: amount,
                },
            },
        });
        await tx.withdrawal.update({
            where: { id: data.withdrawalId },
            data: {
                status: client_1.WithdrawalStatus.COMPLETED,
            },
        });
        return approvedWithdrawal;
    });
    // TODO: Send approval notification to member
    // TODO: Process actual bank transfer/payment
    return result;
};
exports.approveWithdrawal = approveWithdrawal;
const rejectWithdrawal = async (data) => {
    const withdrawal = await database_1.prisma.withdrawal.findUnique({
        where: { id: data.withdrawalId },
        include: {
            member: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    if (!withdrawal)
        throw new Error("Withdrawal request not found");
    if (withdrawal.status !== client_1.WithdrawalStatus.PENDING) {
        throw new Error(`Cannot reject withdrawal. Current status: ${withdrawal.status}`);
    }
    const rejectedWithdrawal = await database_1.prisma.withdrawal.update({
        where: { id: data.withdrawalId },
        data: {
            status: client_1.WithdrawalStatus.REJECTED,
            rejectedAt: new Date(),
            rejectedBy: data.rejectedBy,
            rejectionReason: data.rejectionReason,
        },
        include: {
            member: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    // TODO: Send rejection notification to member with reason
    return rejectedWithdrawal;
};
exports.rejectWithdrawal = rejectWithdrawal;
const getMemberWithdrawals = async (memberId, status) => {
    const withdrawals = await database_1.prisma.withdrawal.findMany({
        where: {
            memberId,
            ...(status && { status }),
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                },
            },
        },
        orderBy: {
            requestedAt: "desc",
        },
    });
    return withdrawals;
};
exports.getMemberWithdrawals = getMemberWithdrawals;
const getPendingWithdrawals = async () => {
    const withdrawals = await database_1.prisma.withdrawal.findMany({
        where: {
            status: client_1.WithdrawalStatus.PENDING,
        },
        include: {
            member: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                },
            },
        },
        orderBy: {
            requestedAt: "asc",
        },
    });
    return withdrawals;
};
exports.getPendingWithdrawals = getPendingWithdrawals;
const getWithdrawalByReference = async (reference) => {
    const withdrawal = await database_1.prisma.withdrawal.findUnique({
        where: { reference },
        include: {
            member: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                },
            },
        },
    });
    if (!withdrawal)
        throw new Error("Withdrawal not found");
    return withdrawal;
};
exports.getWithdrawalByReference = getWithdrawalByReference;
const cancelWithdrawal = async (withdrawalId, memberId) => {
    const withdrawal = await database_1.prisma.withdrawal.findUnique({
        where: { id: withdrawalId },
    });
    if (!withdrawal)
        throw new Error("Withdrawal request not found");
    if (withdrawal.memberId !== memberId) {
        throw new Error("Unauthorized to cancel this withdrawal");
    }
    if (withdrawal.status !== client_1.WithdrawalStatus.PENDING) {
        throw new Error(`Cannot cancel withdrawal. Current status: ${withdrawal.status}`);
    }
    const cancelledWithdrawal = await database_1.prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
            status: client_1.WithdrawalStatus.REJECTED,
            rejectionReason: "Cancelled by member",
            rejectedAt: new Date(),
        },
    });
    return cancelledWithdrawal;
};
exports.cancelWithdrawal = cancelWithdrawal;
exports.default = {
    requestWithdrawal: exports.requestWithdrawal,
    approveWithdrawal: exports.approveWithdrawal,
    rejectWithdrawal: exports.rejectWithdrawal,
    getMemberWithdrawals: exports.getMemberWithdrawals,
    getPendingWithdrawals: exports.getPendingWithdrawals,
    getWithdrawalByReference: exports.getWithdrawalByReference,
    cancelWithdrawal: exports.cancelWithdrawal,
};
//# sourceMappingURL=withdrawalService.js.map