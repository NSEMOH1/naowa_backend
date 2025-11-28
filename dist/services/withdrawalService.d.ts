import { IApproveWithdrawal, IRejectWithdrawal, IWithdrawSavings } from "../types";
import { WithdrawalStatus } from "@prisma/client";
export declare const requestWithdrawal: (data: IWithdrawSavings) => Promise<{
    member: {
        id: string;
        email: string;
        full_name: string;
        phone: string;
    };
    category: {
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.SavingType;
    };
} & {
    id: string;
    status: import(".prisma/client").$Enums.WithdrawalStatus;
    memberId: string;
    amount: import("@prisma/client/runtime/library").Decimal;
    categoryId: string;
    reference: string;
    reason: string | null;
    rejectionReason: string | null;
    requestedAt: Date;
    approvedAt: Date | null;
    approvedBy: string | null;
    rejectedAt: Date | null;
    rejectedBy: string | null;
}>;
export declare const approveWithdrawal: (data: IApproveWithdrawal) => Promise<{
    member: {
        id: string;
        email: string;
        full_name: string;
    };
    category: {
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.SavingType;
    };
} & {
    id: string;
    status: import(".prisma/client").$Enums.WithdrawalStatus;
    memberId: string;
    amount: import("@prisma/client/runtime/library").Decimal;
    categoryId: string;
    reference: string;
    reason: string | null;
    rejectionReason: string | null;
    requestedAt: Date;
    approvedAt: Date | null;
    approvedBy: string | null;
    rejectedAt: Date | null;
    rejectedBy: string | null;
}>;
export declare const rejectWithdrawal: (data: IRejectWithdrawal) => Promise<{
    member: {
        id: string;
        email: string;
        full_name: string;
    };
    category: {
        id: string;
        name: string;
    };
} & {
    id: string;
    status: import(".prisma/client").$Enums.WithdrawalStatus;
    memberId: string;
    amount: import("@prisma/client/runtime/library").Decimal;
    categoryId: string;
    reference: string;
    reason: string | null;
    rejectionReason: string | null;
    requestedAt: Date;
    approvedAt: Date | null;
    approvedBy: string | null;
    rejectedAt: Date | null;
    rejectedBy: string | null;
}>;
export declare const getMemberWithdrawals: (memberId: string, status?: WithdrawalStatus) => Promise<({
    category: {
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.SavingType;
    };
} & {
    id: string;
    status: import(".prisma/client").$Enums.WithdrawalStatus;
    memberId: string;
    amount: import("@prisma/client/runtime/library").Decimal;
    categoryId: string;
    reference: string;
    reason: string | null;
    rejectionReason: string | null;
    requestedAt: Date;
    approvedAt: Date | null;
    approvedBy: string | null;
    rejectedAt: Date | null;
    rejectedBy: string | null;
})[]>;
export declare const getPendingWithdrawals: () => Promise<({
    member: {
        id: string;
        email: string;
        full_name: string;
        phone: string;
    };
    category: {
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.SavingType;
    };
} & {
    id: string;
    status: import(".prisma/client").$Enums.WithdrawalStatus;
    memberId: string;
    amount: import("@prisma/client/runtime/library").Decimal;
    categoryId: string;
    reference: string;
    reason: string | null;
    rejectionReason: string | null;
    requestedAt: Date;
    approvedAt: Date | null;
    approvedBy: string | null;
    rejectedAt: Date | null;
    rejectedBy: string | null;
})[]>;
export declare const getWithdrawalByReference: (reference: string) => Promise<{
    member: {
        id: string;
        email: string;
        full_name: string;
        phone: string;
    };
    category: {
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.SavingType;
    };
} & {
    id: string;
    status: import(".prisma/client").$Enums.WithdrawalStatus;
    memberId: string;
    amount: import("@prisma/client/runtime/library").Decimal;
    categoryId: string;
    reference: string;
    reason: string | null;
    rejectionReason: string | null;
    requestedAt: Date;
    approvedAt: Date | null;
    approvedBy: string | null;
    rejectedAt: Date | null;
    rejectedBy: string | null;
}>;
export declare const cancelWithdrawal: (withdrawalId: string, memberId: string) => Promise<{
    id: string;
    status: import(".prisma/client").$Enums.WithdrawalStatus;
    memberId: string;
    amount: import("@prisma/client/runtime/library").Decimal;
    categoryId: string;
    reference: string;
    reason: string | null;
    rejectionReason: string | null;
    requestedAt: Date;
    approvedAt: Date | null;
    approvedBy: string | null;
    rejectedAt: Date | null;
    rejectedBy: string | null;
}>;
declare const _default: {
    requestWithdrawal: (data: IWithdrawSavings) => Promise<{
        member: {
            id: string;
            email: string;
            full_name: string;
            phone: string;
        };
        category: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.SavingType;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.WithdrawalStatus;
        memberId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        reference: string;
        reason: string | null;
        rejectionReason: string | null;
        requestedAt: Date;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectedAt: Date | null;
        rejectedBy: string | null;
    }>;
    approveWithdrawal: (data: IApproveWithdrawal) => Promise<{
        member: {
            id: string;
            email: string;
            full_name: string;
        };
        category: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.SavingType;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.WithdrawalStatus;
        memberId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        reference: string;
        reason: string | null;
        rejectionReason: string | null;
        requestedAt: Date;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectedAt: Date | null;
        rejectedBy: string | null;
    }>;
    rejectWithdrawal: (data: IRejectWithdrawal) => Promise<{
        member: {
            id: string;
            email: string;
            full_name: string;
        };
        category: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.WithdrawalStatus;
        memberId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        reference: string;
        reason: string | null;
        rejectionReason: string | null;
        requestedAt: Date;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectedAt: Date | null;
        rejectedBy: string | null;
    }>;
    getMemberWithdrawals: (memberId: string, status?: WithdrawalStatus) => Promise<({
        category: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.SavingType;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.WithdrawalStatus;
        memberId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        reference: string;
        reason: string | null;
        rejectionReason: string | null;
        requestedAt: Date;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectedAt: Date | null;
        rejectedBy: string | null;
    })[]>;
    getPendingWithdrawals: () => Promise<({
        member: {
            id: string;
            email: string;
            full_name: string;
            phone: string;
        };
        category: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.SavingType;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.WithdrawalStatus;
        memberId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        reference: string;
        reason: string | null;
        rejectionReason: string | null;
        requestedAt: Date;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectedAt: Date | null;
        rejectedBy: string | null;
    })[]>;
    getWithdrawalByReference: (reference: string) => Promise<{
        member: {
            id: string;
            email: string;
            full_name: string;
            phone: string;
        };
        category: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.SavingType;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.WithdrawalStatus;
        memberId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        reference: string;
        reason: string | null;
        rejectionReason: string | null;
        requestedAt: Date;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectedAt: Date | null;
        rejectedBy: string | null;
    }>;
    cancelWithdrawal: (withdrawalId: string, memberId: string) => Promise<{
        id: string;
        status: import(".prisma/client").$Enums.WithdrawalStatus;
        memberId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        reference: string;
        reason: string | null;
        rejectionReason: string | null;
        requestedAt: Date;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectedAt: Date | null;
        rejectedBy: string | null;
    }>;
};
export default _default;
//# sourceMappingURL=withdrawalService.d.ts.map