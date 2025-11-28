import { Prisma } from "@prisma/client";
interface GetTransactionsParams {
    memberId: string;
    startDate?: Date | string;
    endDate?: Date | string;
}
export declare const getTransactions: ({ memberId, startDate, endDate, }: GetTransactionsParams) => Promise<{
    id: string;
    status: import(".prisma/client").$Enums.TransactionStatus;
    memberId: string | null;
    amount: Prisma.Decimal;
    createdAt: Date;
    updatedAt: Date;
    reference: string | null;
    type: import(".prisma/client").$Enums.TransactionType;
    description: string;
    savingId: string | null;
    loanId: string | null;
}[]>;
export {};
//# sourceMappingURL=transactionService.d.ts.map