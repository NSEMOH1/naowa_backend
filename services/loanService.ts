import {
  LoanName,
  LoanStatus,
  RepaymentStatus,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import { prisma } from "../config/database";
import { LoanApplicationData, LoanBalance, MemberLoanHistory } from "../types";
import Decimal from "decimal.js";
import {
  generateLoanReference,
  generateOTP,
  verifyOTP,
} from "../utils/functions";
import { sendOTPEmail } from "../utils/emailTransporter";

export const applyForLoan = async (applicationData: LoanApplicationData) => {
  const {
    memberId,
    category,
    amount,
    durationMonths,
    nonIndebtedness,
    application,
    validId,
    incomeProof,
    accountStatement,
    utilityBill,
    guarantorLetter,
    guarantorPassport,
    personalPassport,
    servicingLoan,
  } = applicationData;

  return await prisma.$transaction(async (tx) => {
    const member = await tx.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    // if (member.status !== "ACTIVE") {
    //   throw new Error("Member account is not active");
    // }

    const loanCategory = await tx.loanCategory.findFirst({
      where: {
        name: category,
        isActive: true,
      },
    });

    if (!loanCategory || !loanCategory.isActive) {
      throw new Error("Loan category not found or inactive");
    }

    if (amount <= 0) {
      throw new Error("Loan amount must be greater than zero");
    }

    if (durationMonths <= 0) {
      throw new Error("Loan duration must be at least 1 month");
    }

    const existingPendingLoan = await tx.loan.findFirst({
      where: {
        memberId,
        status: {
          in: [
            LoanStatus.PENDING,
            LoanStatus.PENDING_VERIFICATION,
            LoanStatus.ACTIVE,
          ],
        },
      },
    });

    if (existingPendingLoan) {
      throw new Error(
        "You already have a pending loan application or an active loan. Please wait for it to be processed or payback your existing loan."
      );
    }

    let interestRate: number;

    if (loanCategory.interestRate) {
      interestRate = loanCategory.interestRate.toNumber();
    } else {
      interestRate = durationMonths <= 12 ? 5 : 7;
    }

    const reference = generateLoanReference();

    const loan = await tx.loan.create({
      data: {
        categoryId: loanCategory.id,
        memberId,
        amount: new Decimal(amount),
        approvedAmount: new Decimal(0),
        status: LoanStatus.PENDING_VERIFICATION,
        interestRate,
        durationMonths,
        reference,
        startDate: null,
        endDate: null,
        nonIndebtedness,
        application,
        validId,
        incomeProof,
        accountStatement,
        utilityBill,
        guarantorLetter,
        guarantorPassport,
        personalPassport,
        servicingLoan,
      },
    });

    const repaymentSchedule = calculateRepayments(
      loan.id,
      new Decimal(amount),
      interestRate,
      durationMonths
    );

    await tx.repayment.createMany({
      data: repaymentSchedule,
    });

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await tx.loan.update({
      where: { id: loan.id },
      data: {
        otp,
        otpExpiresAt,
      },
    });

    await tx.transaction.create({
      data: {
        loanId: loan.id,
        memberId,
        type: TransactionType.PENDING,
        amount: new Decimal(amount),
        status: TransactionStatus.PENDING,
        description: `Loan application for ${loanCategory.name} - awaiting OTP verification`,
        reference,
      },
    });

    try {
      await sendOTPEmail(member.email, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
    }

    return {
      loan: {
        id: loan.id,
        reference: loan.reference,
        amount: loan.amount.toNumber(),
        category: loanCategory.name,
        durationMonths: loan.durationMonths,
        interestRate: loan.interestRate,
        status: loan.status,
        createdAt: loan.createdAt,
      },
      otp: otp,
      otpSent: true,
      otpExpiresAt,
      message:
        "Loan application submitted successfully. Please verify with OTP sent to your phone.",
    };
  });
};

// TODO: Send OTP via SMS OR MAIL

export const calculateRepayments = (
  loanId: string,
  principal: Decimal,
  annualInterestRate: number,
  durationMonths: number
) => {
  const interestRate = new Decimal(annualInterestRate).div(100);

  const totalInterest = principal
    .mul(interestRate)
    .mul(new Decimal(durationMonths).div(12));

  const totalRepayment = principal.add(totalInterest);
  const monthlyPayment = totalRepayment.div(durationMonths).toDecimalPlaces(2);

  return Array.from({ length: durationMonths }, (_, i) => ({
    loanId,
    amount: monthlyPayment,
    dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000),
    status: RepaymentStatus.PENDING,
  }));
};

export const confirmLoanWithOTP = async (
  loanId: string,
  otp: string,
  memberId: string
) => {
  const isValid = await verifyOTP(loanId, otp);
  if (!isValid) {
    throw new Error("Invalid or expired OTP");
  }

  return await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({
      where: { id: loanId, memberId },
    });

    if (!loan) {
      throw new Error("Loan not found");
    }

    if (loan.status !== LoanStatus.PENDING_VERIFICATION) {
      throw new Error(
        "Loan has already been verified or is not pending verification"
      );
    }

    const updatedLoan = await tx.loan.update({
      where: { id: loanId, memberId },
      data: {
        status: LoanStatus.PENDING,
        otp: null,
        otpExpiresAt: null,
      },
    });

    await tx.transaction.updateMany({
      where: {
        loanId,
        type: TransactionType.PENDING,
        status: TransactionStatus.PENDING,
      },
      data: {
        description:
          "Loan application verified via OTP - awaiting admin review",
      },
    });

    return updatedLoan;
  });
};
export const approveLoan = async (
  data: { loanId: string },
  adminId: string
) => {
  try {
    const existingLoan = await prisma.loan.findUnique({
      where: { id: data.loanId },
      include: { member: true },
    });

    if (!existingLoan) {
      throw new Error("Loan not found");
    }

    if (existingLoan.status !== LoanStatus.PENDING) {
      throw new Error("Only pending loans can be approved");
    }

    const result = await prisma.$transaction(async (tx) => {
      const principal = existingLoan.amount.toNumber();
      const interestRate = existingLoan.interestRate / 100;
      const totalInterest = principal * interestRate;
      const totalAmount = principal + totalInterest;

      const updatedLoan = await tx.loan.update({
        where: { id: data.loanId },
        data: {
          status: LoanStatus.APPROVED,
          approvedAmount: totalAmount,
          approvedById: adminId,
          updatedAt: new Date(),
        },
      });

      await tx.transaction.updateMany({
        where: {
          loanId: data.loanId,
          type: TransactionType.PENDING,
          status: TransactionStatus.PENDING,
        },
        data: {
          status: TransactionStatus.COMPLETED,
          description: "Loan application approved",
          amount: totalAmount,
        },
      });

      await tx.notification.create({
        data: {
          memberId: existingLoan.memberId,
          title: "Loan Approved",
          message: `Your loan of ₦${principal.toLocaleString()} has been approved. Total amount with interest: ₦${totalAmount.toLocaleString()}. Disbursement will be processed soon.`,
          type: "SUCCESS",
          actionType: "LOAN_APPROVED",
          actionId: data.loanId,
          metadata: {
            principal,
            totalInterest,
            totalAmount,
            interestRate: existingLoan.interestRate,
          },
        },
      });

      return { updatedLoan };
    });

    return {
      success: true,
      loan: result.updatedLoan,
      message: "Loan approved successfully. Ready for disbursement.",
    };
  } catch (error) {
    console.error("Error approving loan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const disburseLoan = async (
  data: { loanId: string },
  adminId: string
) => {
  try {
    const existingLoan = await prisma.loan.findUnique({
      where: { id: data.loanId },
      include: {
        member: true,
        category: true,
        repayments: true,
      },
    });

    if (!existingLoan) {
      throw new Error("Loan not found");
    }

    if (existingLoan.status !== LoanStatus.APPROVED) {
      throw new Error("Only approved loans can be disbursed");
    }

    const startDate = new Date();
    const durationMonths = existingLoan.durationMonths;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const principal = Number(existingLoan.approvedAmount);
    const interestRate = existingLoan.interestRate / 100;
    const totalInterest = principal * interestRate;
    const totalAmount = principal + totalInterest;
    const monthlyPayment = totalAmount / durationMonths;

    const result = await prisma.$transaction(async (tx) => {
      const updatedLoan = await tx.loan.update({
        where: { id: data.loanId },
        data: {
          status: LoanStatus.ACTIVE,
          startDate,
          endDate,
          updatedAt: new Date(),
        },
      });

      await tx.balances.upsert({
        where: { memberId: existingLoan.memberId },
        create: {
          memberId: existingLoan.memberId,
          loan_balance: totalAmount,
          savings_balance: 0,
        },
        update: {
          loan_balance: {
            increment: totalAmount,
          },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          memberId: existingLoan.memberId,
          loanId: data.loanId,
          type: TransactionType.LOAN_DISBURSEMENT,
          amount: principal,
          status: TransactionStatus.COMPLETED,
          description: `Loan disbursed - ${durationMonths} months at ${existingLoan.interestRate}% interest`,
          reference: `DISB_${existingLoan.reference}`,
        },
      });

      if (existingLoan.repayments.length > 0) {
        await tx.repayment.deleteMany({
          where: { loanId: data.loanId },
        });
      }

      const repayments = [];
      for (let i = 1; i <= durationMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        repayments.push({
          loanId: data.loanId,
          amount: monthlyPayment,
          dueDate,
          status: "PENDING" as const,
        });
      }

      await tx.repayment.createMany({
        data: repayments,
      });

      await tx.notification.create({
        data: {
          memberId: existingLoan.memberId,
          title: "Loan Disbursed",
          message: `Your loan of ₦${principal.toLocaleString()} has been disbursed. Monthly repayment: ₦${monthlyPayment.toLocaleString()}. First payment due: ${repayments[0].dueDate.toLocaleDateString()}`,
          type: "SUCCESS",
          actionType: "LOAN_DISBURSEMENT",
          actionId: data.loanId,
          metadata: {
            principal,
            totalAmount,
            monthlyPayment,
            durationMonths,
            interestRate: existingLoan.interestRate,
            firstPaymentDue: repayments[0].dueDate,
          },
        },
      });

      return {
        updatedLoan,
        transaction,
        repaymentSchedule: repayments,
        loanSummary: {
          principal,
          totalInterest,
          totalAmount,
          monthlyPayment,
          durationMonths,
          startDate,
          endDate,
        },
      };
    });

    return {
      success: true,
      loan: result.updatedLoan,
      transaction: result.transaction,
      repaymentSchedule: result.repaymentSchedule,
      loanSummary: result.loanSummary,
      message: "Loan disbursed successfully and activated",
    };
  } catch (error) {
    console.error("Error disbursing loan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const rejectLoan = async (
  data: {
    loanId: string;
    rejectionReason?: string;
  },
  adminId: string
) => {
  try {
    const existingLoan = await prisma.loan.findUnique({
      where: { id: data.loanId },
      include: { member: true },
    });

    if (!existingLoan) {
      throw new Error("Loan not found");
    }

    if (existingLoan.status !== LoanStatus.PENDING) {
      throw new Error("Only pending loans can be rejected");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedLoan = await tx.loan.update({
        where: { id: data.loanId },
        data: {
          status: LoanStatus.REJECTED,
          rejectedById: adminId,
          updatedAt: new Date(),
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          memberId: existingLoan.memberId,
          loanId: data.loanId,
          type: TransactionType.LOAN_REJECTED,
          amount: existingLoan.amount,
          status: TransactionStatus.FAILED,
          description: `Loan rejected: ${
            data.rejectionReason || "No reason provided"
          }`,
          reference: `REJ_${existingLoan.reference}`,
        },
      });

      await tx.transaction.updateMany({
        where: {
          loanId: data.loanId,
          type: TransactionType.PENDING,
          status: TransactionStatus.PENDING,
        },
        data: {
          status: TransactionStatus.FAILED,
          description: "Loan application rejected",
        },
      });

      await tx.notification.create({
        data: {
          memberId: existingLoan.memberId,
          title: "Loan Rejected",
          message: `Your loan application has been rejected. Reason: ${
            data.rejectionReason || "No reason provided"
          }`,
          type: "ERROR",
          actionType: "LOAN_REJECTED",
          actionId: data.loanId,
        },
      });

      return { updatedLoan, transaction };
    });

    return {
      success: true,
      loan: result.updatedLoan,
      transaction: result.transaction,
      message: "Loan rejected successfully",
    };
  } catch (error) {
    console.error("Error rejecting loan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const getMemberLoanBalance = async (memberId: string) => {
  const categories = await prisma.loanCategory.findMany({
    select: {
      id: true,
      name: true,
      maxAmount: true,
    },
  });

  const loans = await prisma.loan.findMany({
    where: { memberId },
    include: {
      category: {
        select: { name: true },
      },
      repayments: {
        select: {
          amount: true,
          dueDate: true,
          status: true,
          paidAt: true,
        },
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const loanBalances: LoanBalance[] = loans.map((loan) => {
    const paidRepayments = loan.repayments.filter(
      (r) => r.status === RepaymentStatus.PAID
    );
    const pendingRepayments = loan.repayments.filter(
      (r) => r.status === RepaymentStatus.PENDING
    );

    const totalPaid = paidRepayments.reduce(
      (sum, repayment) => sum + repayment.amount.toNumber(),
      0
    );

    const outstandingBalance = Math.max(
      0,
      loan.approvedAmount.toNumber() - totalPaid
    );

    const totalRepayments = loan.repayments.length;
    const paidCount = paidRepayments.length;
    const percentagePaid =
      totalRepayments > 0 ? Math.round((paidCount / totalRepayments) * 100) : 0;

    return {
      loanId: loan.id,
      category: loan.category.name,
      reference: loan.reference,
      originalAmount: loan.amount.toNumber(),
      approvedAmount: loan.approvedAmount.toNumber(),
      interestRate: loan.interestRate,
      durationMonths: loan.durationMonths,
      totalPaid,
      outstandingBalance,
      status: loan.status,
      startDate: loan.startDate?.toISOString(),
      endDate: loan.endDate?.toISOString(),
      nextPayment:
        pendingRepayments.length > 0
          ? {
              dueDate: pendingRepayments[0].dueDate.toISOString(),
              amount: pendingRepayments[0].amount.toNumber(),
            }
          : undefined,
      repaymentProgress: {
        paid: paidCount,
        remaining: totalRepayments - paidCount,
        percentage: percentagePaid,
      },
    };
  });

  const categoryTotals = await prisma.loan.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
    where: {
      memberId,
      status: LoanStatus.DISBURSED,
    },
  });

  const categorySummary = categories.map((category) => {
    const categoryTotal = categoryTotals.find(
      (ct) => ct.categoryId === category.id
    );
    const collectedAmount = categoryTotal?._sum.amount?.toNumber() || 0;
    const maxAmount = category.maxAmount?.toNumber() || 0;
    const remainingAmount = Math.max(0, maxAmount - collectedAmount);

    return {
      categoryId: category.id,
      categoryName: category.name,
      maxAmount,
      collectedAmount,
      remainingAmount,
      percentageCollected:
        maxAmount > 0 ? Math.round((collectedAmount / maxAmount) * 100) : 0,
    };
  });

  const summary = {
    totalOutstanding: loanBalances.reduce(
      (sum, loan) =>
        sum + (loan.outstandingBalance > 0 ? loan.outstandingBalance : 0),
      0
    ),
    totalPaid: loanBalances.reduce((sum, loan) => sum + loan.totalPaid, 0),
    activeLoans: loanBalances.filter(
      (loan) => loan.status === LoanStatus.ACTIVE
    ).length,
    completedLoans: loanBalances.filter(
      (loan) => loan.status === LoanStatus.COMPLETED
    ).length,
    defaultedLoans: loanBalances.filter(
      (loan) => loan.status === LoanStatus.DEFAULTED
    ).length,
  };

  return {
    data: {
      loans: loanBalances,
      summary,
      categories: categorySummary,
    },
  };
};

export const getAllLoans = () => {
  const loans = prisma.loan.findMany({
    select: {
      id: true,
      category: {
        select: {
          name: true,
        },
      },
      amount: true,
      approvedAmount: true,
      status: true,
      interestRate: true,
      durationMonths: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      reference: true,
      servicingLoan: true,
      application: true,
      nonIndebtedness: true,
      validId: true,
      incomeProof: true,
      accountStatement: true,
      utilityBill: true,
      guarantorLetter: true,
      guarantorPassport: true,
      personalPassport: true,
      member: {
        select: {
          full_name: true,
          bank: {
            select: {
              account_number: true,
            },
          },
        },
      },
      repayments: {
        select: {
          dueDate: true,
          amount: true,
          status: true,
          paidAt: true,
          createdAt: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
      rejectedBy: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
  });

  if (!loans) {
    return "There are no loans at the moment";
  }

  return loans;
};
export const getAdminLoanStatistics = async () => {
  const admins = await prisma.user.findMany({
    select: {
      id: true,
      full_name: true,
      email: true,
    },
  });

  const adminStats = await Promise.all(
    admins.map(async (admin) => {
      const approvedCount = await prisma.loan.count({
        where: {
          approvedById: admin.id,
        },
      });

      const rejectedCount = await prisma.loan.count({
        where: {
          rejectedById: admin.id,
        },
      });

      const disbursedCount = await prisma.loan.count({
        where: {
          approvedById: admin.id,
          status: "DISBURSED",
        },
      });

      const pendingCount = await prisma.loan.count({
        where: {
          approvedById: admin.id,
          status: "PENDING",
        },
      });

      return {
        ...admin,
        approvedCount,
        rejectedCount,
        disbursedCount,
        pendingCount,
        totalActions: approvedCount + rejectedCount,
      };
    })
  );

  return adminStats;
};

export const getMemberLoanHistory = async (
  memberId: string
): Promise<MemberLoanHistory[]> => {
  return await prisma.$transaction(async (tx) => {
    const loans = await tx.loan.findMany({
      where: { memberId },
      include: {
        category: {
          select: { name: true },
        },
        repayments: {
          orderBy: { dueDate: "asc" },
          select: {
            dueDate: true,
            amount: true,
            status: true,
            paidAt: true,
          },
        },
        transactions: {
          where: {
            type: {
              in: [
                TransactionType.LOAN_DISBURSEMENT,
                TransactionType.LOAN_REPAYMENT,
                TransactionType.LOAN_REJECTED,
              ],
            },
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            type: true,
            amount: true,
            createdAt: true,
            status: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!loans || loans.length === 0) {
      return [];
    }

    return loans.map((loan) => {
      const paidRepayments = loan.repayments.filter((r) => r.status === "PAID");
      const pendingRepayments = loan.repayments.filter(
        (r) => r.status === "PENDING"
      );

      const totalRepaid = paidRepayments
        .reduce((sum, repayment) => sum.plus(repayment.amount), new Decimal(0))
        .toNumber();

      const outstandingBalance = Math.max(
        0,
        loan.approvedAmount.toNumber() - totalRepaid
      );

      return {
        id: loan.id,
        reference: loan.reference,
        category: loan.category.name,
        appliedAmount: loan.amount.toNumber(),
        approvedAmount: loan.approvedAmount.toNumber(),
        interestRate: loan.interestRate,
        durationMonths: loan.durationMonths,
        status: loan.status,
        applicationDate: loan.createdAt,
        approvalDate: loan.startDate,
        completionDate: loan.endDate,
        totalRepaid,
        outstandingBalance,
        nextPaymentDue:
          pendingRepayments.length > 0
            ? {
                date: pendingRepayments[0].dueDate,
                amount: pendingRepayments[0].amount.toNumber(),
              }
            : undefined,
        repayments: loan.repayments.map((repayment) => ({
          dueDate: repayment.dueDate,
          amount: repayment.amount.toNumber(),
          status: repayment.status,
          paidDate: repayment.paidAt,
        })),
        transactions: loan.transactions.map((transaction) => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount.toNumber(),
          date: transaction.createdAt,
          status: transaction.status,
          description: transaction.description,
        })),
      };
    });
  });
};

export const fetchActiveLoans = async (memberId: string) => {
  const loans = await prisma.loan.findMany({
    where: {
      memberId,
      status: LoanStatus.ACTIVE,
    },
    include: {
      category: true,
      repayments: {
        where: {
          status: "PENDING",
        },
        orderBy: {
          dueDate: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const loansWithBalance = await Promise.all(
    loans.map(async (loan) => {
      const paidRepayments = await prisma.repayment.findMany({
        where: {
          loanId: loan.id,
          status: "PAID",
        },
      });

      const totalPaid = paidRepayments.reduce(
        (sum, repayment) => sum + Number(repayment.amount),
        0
      );

      const outstandingBalance = Number(loan.approvedAmount) - totalPaid;
      const nextPaymentDue = loan.repayments[0]?.dueDate || null;
      const nextPaymentAmount = loan.repayments[0]?.amount || 0;

      return {
        id: loan.id,
        reference: loan.reference,
        amount: loan.amount,
        approvedAmount: loan.approvedAmount,
        categoryName: loan.category.name,
        interestRate: loan.interestRate,
        durationMonths: loan.durationMonths,
        startDate: loan.startDate,
        endDate: loan.endDate,
        status: loan.status,
        outstandingBalance,
        totalPaid,
        nextPaymentDue,
        nextPaymentAmount,
        pendingPaymentsCount: loan.repayments.length,
        createdAt: loan.createdAt,
      };
    })
  );

  return loansWithBalance;
};
