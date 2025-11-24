import { prisma } from "../config/database";

export const getMemberBalances = async (memberId: string) => {
  const balance = await prisma.balances.findUnique({
    where: { memberId: memberId },
    select: {
      id: true,
      loan_balance: true,
      savings_balance: true,
    },
  });

  return balance;
};
