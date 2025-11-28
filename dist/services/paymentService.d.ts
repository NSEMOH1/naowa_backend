import { PaymentIntentData, PaymentMetadata } from "../types";
export declare const createPaymentIntent: (data: PaymentIntentData) => Promise<{
    reference: string;
    authorizationUrl: any;
    accessCode: any;
}>;
export declare const verifyPaystackTransaction: (reference: string, memberId: string) => Promise<{
    success: boolean;
    message: string;
    transaction: {
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        memberId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        description: string;
        savingId: string | null;
        loanId: string | null;
    };
    saving: {
        id: string;
        status: import(".prisma/client").$Enums.SavingStatus;
        memberId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        reference: string;
    };
} | {
    loanCompleted: boolean;
    totalPaid: number;
    interest: number;
    success: boolean;
    message: string;
    transaction: {
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        memberId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        description: string;
        savingId: string | null;
        loanId: string | null;
    };
    paidRepaymentsCount: number;
} | {
    loanCompleted: boolean;
    remainingBalance: number;
    success: boolean;
    message: string;
    transaction: {
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        memberId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        description: string;
        savingId: string | null;
        loanId: string | null;
    };
    paidRepaymentsCount: number;
} | {
    success: boolean;
    message: string;
    transaction: {
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        memberId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        description: string;
        savingId: string | null;
        loanId: string | null;
    };
}>;
export declare const processPayment: (data: {
    reference: string;
    amount: number;
    metadata: PaymentMetadata;
}) => Promise<{
    success: boolean;
    message: string;
    transaction: {
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        memberId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        description: string;
        savingId: string | null;
        loanId: string | null;
    };
    saving: {
        id: string;
        status: import(".prisma/client").$Enums.SavingStatus;
        memberId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        reference: string;
    };
} | {
    loanCompleted: boolean;
    totalPaid: number;
    interest: number;
    success: boolean;
    message: string;
    transaction: {
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        memberId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        description: string;
        savingId: string | null;
        loanId: string | null;
    };
    paidRepaymentsCount: number;
} | {
    loanCompleted: boolean;
    remainingBalance: number;
    success: boolean;
    message: string;
    transaction: {
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        memberId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        description: string;
        savingId: string | null;
        loanId: string | null;
    };
    paidRepaymentsCount: number;
} | {
    success: boolean;
    message: string;
    transaction: {
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        memberId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        description: string;
        savingId: string | null;
        loanId: string | null;
    };
}>;
export declare const processLoanRepayment: (memberId: string, amount: number, reference: string, loanId?: string) => Promise<{
    loanCompleted: boolean;
    totalPaid: number;
    interest: number;
    success: boolean;
    message: string;
    transaction: {
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        memberId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        description: string;
        savingId: string | null;
        loanId: string | null;
    };
    paidRepaymentsCount: number;
} | {
    loanCompleted: boolean;
    remainingBalance: number;
    success: boolean;
    message: string;
    transaction: {
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        memberId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        description: string;
        savingId: string | null;
        loanId: string | null;
    };
    paidRepaymentsCount: number;
}>;
//# sourceMappingURL=paymentService.d.ts.map