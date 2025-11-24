import Decimal from "decimal.js";
import { prisma } from "../config/database";
import {
  IApproveWithdrawal,
  IRejectWithdrawal,
  IWithdrawSavings,
} from "../types";
import {
  SavingStatus,
  SavingType,
  TransactionType,
  WithdrawalStatus,
} from "@prisma/client";
import { comparePin } from "../utils/password";
import { generateWithdrawalReference } from "../utils/functions";

const getMemberTotalSavings = async (memberId: string): Promise<Decimal> => {
  const balance = await prisma.balances.findUnique({
    where: { memberId },
    select: { savings_balance: true },
  });

  return new Decimal(balance?.savings_balance || 0);
};

const getMemberPendingWithdrawals = async (
  memberId: string
): Promise<Decimal> => {
  const pendingWithdrawals = await prisma.withdrawal.aggregate({
    where: {
      memberId,
      status: WithdrawalStatus.PENDING,
    },
    _sum: {
      amount: true,
    },
  });

  return new Decimal(pendingWithdrawals._sum.amount || 0);
};

export const requestWithdrawal = async (data: IWithdrawSavings) => {
  const validCategories = ["QUICK", "COOPERATIVE"] as const;
  if (!validCategories.includes(data.category_name as SavingType)) {
    throw new Error(
      `Invalid category. Must be one of: ${validCategories.join(", ")}`
    );
  }

  const category = await prisma.savingCategory.findUnique({
    where: { type: data.category_name as SavingType },
  });

  if (!category) throw new Error("Savings Category doesn't exist");

  if (category.name === "COOPERATIVE") {
    throw new Error(
      "You cannot withdraw from COOPERATIVE savings. Please contact the Admin for more information"
    );
  }

  const member = await prisma.member.findUnique({
    where: { id: data.memberId },
    select: {
      id: true,
      pin: true,
      full_name: true,
      email: true,
    },
  });

  if (!member) throw new Error("Member doesn't exist");

  const isPinValid = await comparePin(data.pin, member.pin);
  if (!isPinValid) throw new Error("Invalid PIN");

  const amount = new Decimal(data.amount);
  const zero = new Decimal(0);

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
    throw new Error(
      `Insufficient savings balance. You have ₦${totalSavings.toFixed(
        2
      )} in total savings`
    );
  }

  if (amount.gt(availableBalance)) {
    throw new Error(
      `Insufficient available balance. You have ₦${availableBalance.toFixed(
        2
      )} available ` + `(₦${pendingWithdrawals.toFixed(2)} pending approval)`
    );
  }

  const withdrawal = await prisma.withdrawal.create({
    data: {
      memberId: data.memberId,
      categoryId: category.id,
      amount: amount,
      reference: generateWithdrawalReference(),
      status: WithdrawalStatus.PENDING,
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

  await prisma.transaction.create({
    data: {
      memberId: withdrawal.memberId,
      amount: amount.toNumber(),
      type: TransactionType.SAVINGS_WITHDRAWAL,
      reference: withdrawal.reference,
      description: `Savings withdrawal from ${withdrawal.category.name}`,
      status: SavingStatus.PENDING,
    },
  });

  // TODO: Send notification to admins about new withdrawal request
  // TODO: Send confirmation email/SMS to member

  return withdrawal;
};

export const approveWithdrawal = async (data: IApproveWithdrawal) => {
  const withdrawal = await prisma.withdrawal.findUnique({
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

  if (!withdrawal) throw new Error("Withdrawal request not found");

  if (withdrawal.status !== WithdrawalStatus.PENDING) {
    throw new Error(
      `Cannot approve withdrawal. Current status: ${withdrawal.status}`
    );
  }

  const amount = new Decimal(withdrawal.amount);
  const totalSavings = await getMemberTotalSavings(withdrawal.memberId);

  if (totalSavings.lt(amount)) {
    throw new Error(
      "Insufficient savings balance. Member may have made other withdrawals."
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const approvedWithdrawal = await tx.withdrawal.update({
      where: { id: data.withdrawalId },
      data: {
        status: WithdrawalStatus.APPROVED,
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
        status: SavingStatus.COMPLETED,
      },
    });

    await tx.transaction.updateMany({
      where: {
        reference: withdrawal.reference,
        type: TransactionType.SAVINGS_WITHDRAWAL,
      },
      data: {
        status: SavingStatus.COMPLETED,
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
        status: WithdrawalStatus.COMPLETED,
      },
    });

    return approvedWithdrawal;
  });

  // TODO: Send approval notification to member
  // TODO: Process actual bank transfer/payment

  return result;
};
export const rejectWithdrawal = async (data: IRejectWithdrawal) => {
  const withdrawal = await prisma.withdrawal.findUnique({
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

  if (!withdrawal) throw new Error("Withdrawal request not found");

  if (withdrawal.status !== WithdrawalStatus.PENDING) {
    throw new Error(
      `Cannot reject withdrawal. Current status: ${withdrawal.status}`
    );
  }

  const rejectedWithdrawal = await prisma.withdrawal.update({
    where: { id: data.withdrawalId },
    data: {
      status: WithdrawalStatus.REJECTED,
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

export const getMemberWithdrawals = async (
  memberId: string,
  status?: WithdrawalStatus
) => {
  const withdrawals = await prisma.withdrawal.findMany({
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

export const getPendingWithdrawals = async () => {
  const withdrawals = await prisma.withdrawal.findMany({
    where: {
      status: WithdrawalStatus.PENDING,
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

export const getWithdrawalByReference = async (reference: string) => {
  const withdrawal = await prisma.withdrawal.findUnique({
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

  if (!withdrawal) throw new Error("Withdrawal not found");

  return withdrawal;
};

export const cancelWithdrawal = async (
  withdrawalId: string,
  memberId: string
) => {
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) throw new Error("Withdrawal request not found");

  if (withdrawal.memberId !== memberId) {
    throw new Error("Unauthorized to cancel this withdrawal");
  }

  if (withdrawal.status !== WithdrawalStatus.PENDING) {
    throw new Error(
      `Cannot cancel withdrawal. Current status: ${withdrawal.status}`
    );
  }

  const cancelledWithdrawal = await prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: {
      status: WithdrawalStatus.REJECTED,
      rejectionReason: "Cancelled by member",
      rejectedAt: new Date(),
    },
  });

  return cancelledWithdrawal;
};

export default {
  requestWithdrawal,
  approveWithdrawal,
  rejectWithdrawal,
  getMemberWithdrawals,
  getPendingWithdrawals,
  getWithdrawalByReference,
  cancelWithdrawal,
};
