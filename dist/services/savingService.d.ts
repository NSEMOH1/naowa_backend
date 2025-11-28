import { Decimal } from "@prisma/client/runtime/library";
import { createSavings, IWithdrawSavings, UploadResult } from "../types";
export declare const getMemberTotalSavings: (memberId: string) => Promise<Decimal>;
export declare const addSavings: (data: createSavings) => Promise<{
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
    status: import(".prisma/client").$Enums.SavingStatus;
    memberId: string;
    amount: Decimal;
    createdAt: Date;
    updatedAt: Date;
    categoryId: string;
    reference: string;
}>;
export declare const withdrawSavings: (data: IWithdrawSavings) => Promise<{
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
    status: import(".prisma/client").$Enums.SavingStatus;
    memberId: string;
    amount: Decimal;
    createdAt: Date;
    updatedAt: Date;
    categoryId: string;
    reference: string;
}>;
export declare const getSavingsBalance: (memberId: string) => Promise<{
    totalSavings: Decimal;
    monthlyDeduction: string;
    normalSavings: Decimal;
    cooperativeSavings: Decimal;
    details: Array<{
        categoryId: string;
        categoryName: string;
        amount: Decimal;
    }>;
}>;
export declare const editDeduction: (amount: string, memberId: string) => Promise<{
    data: {
        id: string;
        monthlyDeduction: string;
    };
    message: string;
}>;
export declare const getAllSavings: () => Promise<{
    savings: {
        id: string;
        member: {
            email: string;
            full_name: string;
            phone: string;
        };
        status: import(".prisma/client").$Enums.SavingStatus;
        amount: Decimal;
        createdAt: Date;
        reference: string;
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.SavingType;
            interestRate: Decimal;
        };
    }[];
    total: number | Decimal;
}>;
export declare const uploadCooperativeSavingsFromExcel: (fileBuffer: Buffer, uploadedBy?: string) => Promise<UploadResult>;
//# sourceMappingURL=savingService.d.ts.map