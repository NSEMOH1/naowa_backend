import { LoanApplicationData, LoanBalance, MemberLoanHistory } from "../types";
import Decimal from "decimal.js";
export declare const applyForLoan: (applicationData: LoanApplicationData) => Promise<{
    loan: {
        id: string;
        reference: string;
        amount: number;
        category: import(".prisma/client").$Enums.LoanName;
        durationMonths: number;
        interestRate: number;
        status: import(".prisma/client").$Enums.LoanStatus;
        createdAt: Date;
    };
    otp: string;
    otpSent: boolean;
    otpExpiresAt: Date;
    message: string;
}>;
export declare const calculateRepayments: (loanId: string, principal: Decimal, annualInterestRate: number, durationMonths: number) => {
    loanId: string;
    amount: Decimal;
    dueDate: Date;
    status: "PENDING";
}[];
export declare const confirmLoanWithOTP: (loanId: string, otp: string, memberId: string) => Promise<{
    id: string;
    status: import(".prisma/client").$Enums.LoanStatus;
    memberId: string;
    amount: import("@prisma/client/runtime/library").Decimal;
    createdAt: Date;
    updatedAt: Date;
    categoryId: string;
    reference: string;
    userId: string | null;
    approvedAmount: import("@prisma/client/runtime/library").Decimal;
    interestRate: number;
    durationMonths: number;
    startDate: Date | null;
    endDate: Date | null;
    otp: string | null;
    otpExpiresAt: Date | null;
    transferredAt: Date | null;
    approvedById: string | null;
    rejectedById: string | null;
    validId: string;
    incomeProof: string;
    accountStatement: string;
    utilityBill: string;
    guarantorLetter: string;
    guarantorPassport: string;
    personalPassport: string;
    nonIndebtedness: string;
    application: string;
    servicingLoan: string;
}>;
export declare const approveLoan: (data: {
    loanId: string;
}, adminId: string) => Promise<{
    success: boolean;
    loan: {
        id: string;
        status: import(".prisma/client").$Enums.LoanStatus;
        memberId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        reference: string;
        userId: string | null;
        approvedAmount: import("@prisma/client/runtime/library").Decimal;
        interestRate: number;
        durationMonths: number;
        startDate: Date | null;
        endDate: Date | null;
        otp: string | null;
        otpExpiresAt: Date | null;
        transferredAt: Date | null;
        approvedById: string | null;
        rejectedById: string | null;
        validId: string;
        incomeProof: string;
        accountStatement: string;
        utilityBill: string;
        guarantorLetter: string;
        guarantorPassport: string;
        personalPassport: string;
        nonIndebtedness: string;
        application: string;
        servicingLoan: string;
    };
    message: string;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    loan?: undefined;
    message?: undefined;
}>;
export declare const disburseLoan: (data: {
    loanId: string;
}, adminId: string) => Promise<{
    success: boolean;
    loan: {
        id: string;
        status: import(".prisma/client").$Enums.LoanStatus;
        memberId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        reference: string;
        userId: string | null;
        approvedAmount: import("@prisma/client/runtime/library").Decimal;
        interestRate: number;
        durationMonths: number;
        startDate: Date | null;
        endDate: Date | null;
        otp: string | null;
        otpExpiresAt: Date | null;
        transferredAt: Date | null;
        approvedById: string | null;
        rejectedById: string | null;
        validId: string;
        incomeProof: string;
        accountStatement: string;
        utilityBill: string;
        guarantorLetter: string;
        guarantorPassport: string;
        personalPassport: string;
        nonIndebtedness: string;
        application: string;
        servicingLoan: string;
    };
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
    repaymentSchedule: {
        loanId: string;
        amount: number;
        dueDate: Date;
        status: "PENDING";
    }[];
    loanSummary: {
        principal: number;
        totalInterest: number;
        totalAmount: number;
        monthlyPayment: number;
        durationMonths: number;
        startDate: Date;
        endDate: Date;
    };
    message: string;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    loan?: undefined;
    transaction?: undefined;
    repaymentSchedule?: undefined;
    loanSummary?: undefined;
    message?: undefined;
}>;
export declare const rejectLoan: (data: {
    loanId: string;
    rejectionReason?: string;
}, adminId: string) => Promise<{
    success: boolean;
    loan: {
        id: string;
        status: import(".prisma/client").$Enums.LoanStatus;
        memberId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        reference: string;
        userId: string | null;
        approvedAmount: import("@prisma/client/runtime/library").Decimal;
        interestRate: number;
        durationMonths: number;
        startDate: Date | null;
        endDate: Date | null;
        otp: string | null;
        otpExpiresAt: Date | null;
        transferredAt: Date | null;
        approvedById: string | null;
        rejectedById: string | null;
        validId: string;
        incomeProof: string;
        accountStatement: string;
        utilityBill: string;
        guarantorLetter: string;
        guarantorPassport: string;
        personalPassport: string;
        nonIndebtedness: string;
        application: string;
        servicingLoan: string;
    };
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
    message: string;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    loan?: undefined;
    transaction?: undefined;
    message?: undefined;
}>;
export declare const getMemberLoanBalance: (memberId: string) => Promise<{
    data: {
        loans: LoanBalance[];
        summary: {
            totalOutstanding: number;
            totalPaid: number;
            activeLoans: number;
            completedLoans: number;
            defaultedLoans: number;
        };
        categories: {
            categoryId: string;
            categoryName: import(".prisma/client").$Enums.LoanName;
            maxAmount: number;
            collectedAmount: number;
            remainingAmount: number;
            percentageCollected: number;
        }[];
    };
}>;
export declare const getAllLoans: () => "There are no loans at the moment" | import(".prisma/client").Prisma.PrismaPromise<{
    id: string;
    member: {
        full_name: string;
        bank: {
            account_number: string;
        }[];
    };
    status: import(".prisma/client").$Enums.LoanStatus;
    amount: import("@prisma/client/runtime/library").Decimal;
    createdAt: Date;
    reference: string;
    approvedAmount: import("@prisma/client/runtime/library").Decimal;
    interestRate: number;
    durationMonths: number;
    startDate: Date | null;
    endDate: Date | null;
    validId: string;
    incomeProof: string;
    accountStatement: string;
    utilityBill: string;
    guarantorLetter: string;
    guarantorPassport: string;
    personalPassport: string;
    nonIndebtedness: string;
    application: string;
    servicingLoan: string;
    approvedBy: {
        id: string;
        email: string;
        full_name: string;
    } | null;
    rejectedBy: {
        id: string;
        email: string;
        full_name: string;
    } | null;
    category: {
        name: import(".prisma/client").$Enums.LoanName;
    };
    repayments: {
        status: import(".prisma/client").$Enums.RepaymentStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        dueDate: Date;
        paidAt: Date | null;
    }[];
}[]>;
export declare const getAdminLoanStatistics: () => Promise<{
    approvedCount: number;
    rejectedCount: number;
    disbursedCount: number;
    pendingCount: number;
    totalActions: number;
    id: string;
    email: string;
    full_name: string;
}[]>;
export declare const getMemberLoanHistory: (memberId: string) => Promise<MemberLoanHistory[]>;
export declare const fetchActiveLoans: (memberId: string) => Promise<{
    id: string;
    reference: string;
    amount: import("@prisma/client/runtime/library").Decimal;
    approvedAmount: import("@prisma/client/runtime/library").Decimal;
    categoryName: import(".prisma/client").$Enums.LoanName;
    interestRate: number;
    durationMonths: number;
    startDate: Date | null;
    endDate: Date | null;
    status: import(".prisma/client").$Enums.LoanStatus;
    outstandingBalance: number;
    totalPaid: number;
    nextPaymentDue: Date;
    nextPaymentAmount: import("@prisma/client/runtime/library").Decimal;
    pendingPaymentsCount: number;
    createdAt: Date;
}[]>;
//# sourceMappingURL=loanService.d.ts.map