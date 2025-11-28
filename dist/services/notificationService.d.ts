import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import { Decimal } from "@prisma/client/runtime/library";
interface NotificationData {
    title: string;
    message: string;
    type: "SUCCESS" | "INFO" | "WARNING" | "ERROR";
    actionType: string;
    actionId?: string;
    memberId?: string;
    userId?: string;
    metadata?: Record<string, any>;
}
declare const initializeNotificationService: (server: Server) => void;
declare const createAndBroadcastNotification: (data: NotificationData) => Promise<{
    member: {
        id: string;
        email: string;
        full_name: string;
    } | null;
    User: {
        id: string;
        email: string;
        full_name: string;
        department: import(".prisma/client").$Enums.Department;
    } | null;
} & {
    id: string;
    status: import(".prisma/client").$Enums.NotificationStatus;
    memberId: string | null;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    message: string;
    actionType: string;
    actionId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    userId: string | null;
}>;
declare const notifyLoanApplication: (memberId: string, loanId: string, amount: string, categoryName: string) => Promise<({
    member: {
        id: string;
        email: string;
        full_name: string;
    } | null;
    User: {
        id: string;
        email: string;
        full_name: string;
        department: import(".prisma/client").$Enums.Department;
    } | null;
} & {
    id: string;
    status: import(".prisma/client").$Enums.NotificationStatus;
    memberId: string | null;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    message: string;
    actionType: string;
    actionId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    userId: string | null;
})[]>;
declare const notifyLoanStatus: (memberId: string, loanId: string, status: string, userId: string, amount: Decimal, categoryName: string) => Promise<{
    member: {
        id: string;
        email: string;
        full_name: string;
    } | null;
    User: {
        id: string;
        email: string;
        full_name: string;
        department: import(".prisma/client").$Enums.Department;
    } | null;
} & {
    id: string;
    status: import(".prisma/client").$Enums.NotificationStatus;
    memberId: string | null;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    message: string;
    actionType: string;
    actionId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    userId: string | null;
}>;
declare const notifySavingsDeposit: (memberId: string, savingId: string, amount: string, categoryName: string) => Promise<({
    member: {
        id: string;
        email: string;
        full_name: string;
    } | null;
    User: {
        id: string;
        email: string;
        full_name: string;
        department: import(".prisma/client").$Enums.Department;
    } | null;
} & {
    id: string;
    status: import(".prisma/client").$Enums.NotificationStatus;
    memberId: string | null;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    message: string;
    actionType: string;
    actionId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    userId: string | null;
})[]>;
declare const notifyMemberRegistration: (memberId: string) => Promise<({
    member: {
        id: string;
        email: string;
        full_name: string;
    } | null;
    User: {
        id: string;
        email: string;
        full_name: string;
        department: import(".prisma/client").$Enums.Department;
    } | null;
} & {
    id: string;
    status: import(".prisma/client").$Enums.NotificationStatus;
    memberId: string | null;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    message: string;
    actionType: string;
    actionId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    userId: string | null;
})[]>;
declare const notifyMemberApproval: (memberId: string, status: string, userId: string) => Promise<{
    member: {
        id: string;
        email: string;
        full_name: string;
    } | null;
    User: {
        id: string;
        email: string;
        full_name: string;
        department: import(".prisma/client").$Enums.Department;
    } | null;
} & {
    id: string;
    status: import(".prisma/client").$Enums.NotificationStatus;
    memberId: string | null;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    message: string;
    actionType: string;
    actionId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    userId: string | null;
}>;
declare const notifyTransaction: (memberId: string, transactionId: string, amount: string, type: string, description: string) => Promise<{
    member: {
        id: string;
        email: string;
        full_name: string;
    } | null;
    User: {
        id: string;
        email: string;
        full_name: string;
        department: import(".prisma/client").$Enums.Department;
    } | null;
} & {
    id: string;
    status: import(".prisma/client").$Enums.NotificationStatus;
    memberId: string | null;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    message: string;
    actionType: string;
    actionId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    userId: string | null;
}>;
declare const broadcastToMembers: (title: string, message: string, type?: "SUCCESS" | "INFO" | "WARNING" | "ERROR") => Promise<({
    member: {
        id: string;
        email: string;
        full_name: string;
    } | null;
    User: {
        id: string;
        email: string;
        full_name: string;
        department: import(".prisma/client").$Enums.Department;
    } | null;
} & {
    id: string;
    status: import(".prisma/client").$Enums.NotificationStatus;
    memberId: string | null;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    message: string;
    actionType: string;
    actionId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    userId: string | null;
})[]>;
declare const broadcastToUsers: (title: string, message: string, type?: "SUCCESS" | "INFO" | "WARNING" | "ERROR") => Promise<({
    member: {
        id: string;
        email: string;
        full_name: string;
    } | null;
    User: {
        id: string;
        email: string;
        full_name: string;
        department: import(".prisma/client").$Enums.Department;
    } | null;
} & {
    id: string;
    status: import(".prisma/client").$Enums.NotificationStatus;
    memberId: string | null;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    message: string;
    actionType: string;
    actionId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    userId: string | null;
})[]>;
declare const getIO: () => SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export { initializeNotificationService, createAndBroadcastNotification, notifyLoanApplication, notifyLoanStatus, notifySavingsDeposit, notifyMemberRegistration, notifyMemberApproval, notifyTransaction, broadcastToMembers, broadcastToUsers, getIO, };
//# sourceMappingURL=notificationService.d.ts.map