import { RequestData } from "../types";
export declare const sendRequest: (data: RequestData) => Promise<{
    id: string;
    status: import(".prisma/client").$Enums.RequestStatus;
    memberId: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
    reason: string;
}>;
export declare const approveRequest: (data: {
    requestId: string;
}) => Promise<{
    success: boolean;
    request: {
        id: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        memberId: string;
        amount: number;
        createdAt: Date;
        updatedAt: Date;
        reason: string;
    };
    message: string;
}>;
export declare const rejectRequest: (data: {
    requestId: string;
}) => Promise<{
    success: boolean;
    request: {
        id: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        memberId: string;
        amount: number;
        createdAt: Date;
        updatedAt: Date;
        reason: string;
    };
    message: string;
}>;
export declare const getAllRequests: (startDate?: Date, endDate?: Date) => Promise<{
    period?: {
        start: Date;
        end: Date;
    } | undefined;
    success: boolean;
    count: number;
    requests: {
        id: string;
        member: {
            id: string;
            email: string;
            full_name: string;
        };
        status: import(".prisma/client").$Enums.RequestStatus;
        amount: number;
        createdAt: Date;
        updatedAt: Date;
        reason: string;
    }[];
}>;
//# sourceMappingURL=requestService.d.ts.map