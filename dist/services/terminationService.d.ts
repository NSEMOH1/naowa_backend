import { ITermination } from "../types";
export declare const requestTermination: (data: ITermination) => Promise<{
    id: string;
    status: import(".prisma/client").$Enums.RequestStatus;
    memberId: string;
    createdAt: Date;
    updatedAt: Date;
    reason: string;
}>;
export declare const getAllTerminations: (page?: number, limit?: number, startDate?: string, endDate?: string) => Promise<{
    success: boolean;
    message: string;
    data: never[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
} | {
    data: ({
        member: {
            id: string;
            email: string;
            full_name: string;
            phone: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        memberId: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string;
    })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    success?: undefined;
    message?: undefined;
}>;
//# sourceMappingURL=terminationService.d.ts.map