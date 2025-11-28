"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.broadcastToUsers = exports.broadcastToMembers = exports.notifyTransaction = exports.notifyMemberApproval = exports.notifyMemberRegistration = exports.notifySavingsDeposit = exports.notifyLoanStatus = exports.notifyLoanApplication = exports.createAndBroadcastNotification = exports.initializeNotificationService = void 0;
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const prisma = new client_1.PrismaClient();
const connectedMembers = new Map();
const connectedUsers = new Map();
let io;
const setupSocketHandlers = () => {
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        socket.on("joinMember", async (memberId) => {
            socket.data.memberId = memberId;
            socket.data.userType = "member";
            connectedMembers.set(memberId, socket.id);
            const pendingNotifications = await prisma.notification.findMany({
                where: { memberId, status: "UNREAD" },
            });
            if (pendingNotifications.length > 0) {
                socket.emit("syncNotifications", pendingNotifications);
            }
        });
        socket.on("joinUser", (userId) => {
            socket.data.userId = userId;
            socket.data.userType = "user";
            connectedUsers.set(userId, socket.id);
            console.log(`User ${userId} joined`);
        });
        socket.on("disconnect", () => {
            if (socket.data.memberId) {
                connectedMembers.delete(socket.data.memberId);
                console.log(`Member ${socket.data.memberId} disconnected`);
            }
            if (socket.data.userId) {
                connectedUsers.delete(socket.data.userId);
                console.log(`User ${socket.data.userId} disconnected`);
            }
        });
        socket.on("reconnect", () => {
            if (socket.data.memberId) {
                connectedMembers.set(socket.data.memberId, socket.id);
            }
            if (socket.data.userId) {
                connectedUsers.set(socket.data.userId, socket.id);
            }
        });
    });
};
const initializeNotificationService = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: env_1.config.allowedOrigins,
            methods: ["GET", "POST"],
        },
    });
    setupSocketHandlers();
};
exports.initializeNotificationService = initializeNotificationService;
const createAndBroadcastNotification = async (data) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                title: data.title,
                message: data.message,
                type: data.type,
                actionType: data.actionType,
                actionId: data.actionId,
                metadata: data.metadata || {},
                memberId: data.memberId || null,
                userId: data.userId || null,
            },
            include: {
                member: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
                User: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        department: true,
                    },
                },
            },
        });
        if (data.memberId) {
            const memberSocketId = connectedMembers.get(data.memberId);
            if (memberSocketId) {
                io.to(memberSocketId).emit("newNotification", notification);
            }
        }
        if (data.userId) {
            const userSocketId = connectedUsers.get(data.userId);
            if (userSocketId) {
                io.to(userSocketId).emit("newNotification", notification);
            }
        }
        return notification;
    }
    catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};
exports.createAndBroadcastNotification = createAndBroadcastNotification;
const notifyLoanApplication = async (memberId, loanId, amount, categoryName) => {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: { full_name: true, username: true },
    });
    if (!member)
        throw new Error("Member not found");
    const eligibleUsers = await prisma.user.findMany({
        where: {
            role: { in: ["ADMIN", "STAFF"] },
            status: "ACTIVE",
        },
    });
    const notifications = [];
    for (const user of eligibleUsers) {
        const notification = await createAndBroadcastNotification({
            title: "New Loan Application",
            message: `${member.full_name} has applied for a ${categoryName} loan of ₦${amount}`,
            type: "INFO",
            actionType: "LOAN_APPLICATION",
            actionId: loanId,
            userId: user.id,
            metadata: { memberId, loanId, amount, categoryName },
        });
        notifications.push(notification);
    }
    return notifications;
};
exports.notifyLoanApplication = notifyLoanApplication;
const notifyLoanStatus = async (memberId, loanId, status, userId, amount, categoryName) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { full_name: true },
    });
    if (!user)
        throw new Error("User not found");
    let message;
    let type;
    if (status === "APPROVED") {
        message = `Your ${categoryName} loan application for ₦${amount.toString()} has been approved by ${user.full_name}`;
        type = "SUCCESS";
    }
    else if (status === "REJECTED") {
        message = `Your ${categoryName} loan application for ₦${amount.toString()} has been rejected by ${user.full_name}`;
        type = "ERROR";
    }
    else {
        message = `Your ${categoryName} loan application status has been updated to ${status}`;
        type = "INFO";
    }
    return await createAndBroadcastNotification({
        title: "Loan Status Update",
        message,
        type,
        actionType: "LOAN_STATUS_UPDATE",
        actionId: loanId,
        memberId,
        metadata: { loanId, status, userId, amount, categoryName },
    });
};
exports.notifyLoanStatus = notifyLoanStatus;
const notifySavingsDeposit = async (memberId, savingId, amount, categoryName) => {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: { full_name: true, username: true },
    });
    if (!member)
        throw new Error("Member not found");
    const eligibleUsers = await prisma.user.findMany({
        where: {
            department: { in: ["ACCOUNT", "OPERATION"] },
            status: "ACTIVE",
        },
    });
    const notifications = [];
    for (const user of eligibleUsers) {
        const notification = await createAndBroadcastNotification({
            title: "New Savings Deposit",
            message: `${member.full_name} has made a ${categoryName} savings deposit of ₦${amount}`,
            type: "INFO",
            actionType: "SAVINGS_DEPOSIT",
            actionId: savingId,
            userId: user.id,
            metadata: { memberId, savingId, amount, categoryName },
        });
        notifications.push(notification);
    }
    return notifications;
};
exports.notifySavingsDeposit = notifySavingsDeposit;
const notifyMemberRegistration = async (memberId) => {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: {
            full_name: true,
            email: true,
        },
    });
    if (!member)
        throw new Error("Member not found");
    const adminUsers = await prisma.user.findMany({
        where: {
            role: { in: ["ADMIN"] },
            status: "ACTIVE",
        },
    });
    const notifications = [];
    for (const user of adminUsers) {
        const notification = await createAndBroadcastNotification({
            title: "New Member Registration",
            message: `New member ${member.full_name} (${member.email}) has registered and is pending approval`,
            type: "INFO",
            actionType: "MEMBER_REGISTRATION",
            actionId: memberId,
            userId: user.id,
            metadata: { memberId },
        });
        notifications.push(notification);
    }
    return notifications;
};
exports.notifyMemberRegistration = notifyMemberRegistration;
const notifyMemberApproval = async (memberId, status, userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { full_name: true },
    });
    if (!user)
        throw new Error("User not found");
    let message;
    let type;
    if (status === "APPROVED") {
        message = `Congratulations! Your membership has been approved by 301 HAG CMS. Welcome to the cooperative!`;
        type = "SUCCESS";
    }
    else if (status === "REJECTED") {
        message = `Your membership application has been rejected by 301 HAG CMS. Please contact support for more information.`;
        type = "ERROR";
    }
    else {
        message = `Your membership status has been updated to ${status}`;
        type = "INFO";
    }
    return await createAndBroadcastNotification({
        title: "Membership Status Update",
        message,
        type,
        actionType: "MEMBER_APPROVAL",
        actionId: memberId,
        memberId,
        metadata: { status, userId },
    });
};
exports.notifyMemberApproval = notifyMemberApproval;
const notifyTransaction = async (memberId, transactionId, amount, type, description) => {
    let message;
    let notificationType;
    switch (type) {
        case "LOAN_DISBURSEMENT":
            message = `Your loan of ₦${amount} has been disbursed to your account`;
            notificationType = "SUCCESS";
            break;
        case "LOAN_REPAYMENT":
            message = `Loan repayment of ₦${amount} has been processed`;
            notificationType = "INFO";
            break;
        case "SAVINGS_DEPOSIT":
            message = `Savings deposit of ₦${amount} has been confirmed`;
            notificationType = "SUCCESS";
            break;
        case "SAVINGS_WITHDRAWAL":
            message = `Savings withdrawal of ₦${amount} has been processed`;
            notificationType = "INFO";
            break;
        default:
            message = `Transaction: ${description} - ₦${amount}`;
            notificationType = "INFO";
    }
    return await createAndBroadcastNotification({
        title: "Transaction Update",
        message,
        type: notificationType,
        actionType: "TRANSACTION",
        actionId: transactionId,
        memberId,
        metadata: { transactionId, amount, type, description },
    });
};
exports.notifyTransaction = notifyTransaction;
const broadcastToMembers = async (title, message, type = "INFO") => {
    const members = await prisma.member.findMany({
        where: { status: "APPROVED" },
        select: { id: true },
    });
    const notifications = [];
    for (const member of members) {
        const notification = await createAndBroadcastNotification({
            title,
            message,
            type,
            actionType: "BROADCAST",
            memberId: member.id,
            metadata: { broadcast: true },
        });
        notifications.push(notification);
    }
    return notifications;
};
exports.broadcastToMembers = broadcastToMembers;
const broadcastToUsers = async (title, message, type = "INFO") => {
    const users = await prisma.user.findMany({
        where: { status: "ACTIVE" },
        select: { id: true },
    });
    const notifications = [];
    for (const user of users) {
        const notification = await createAndBroadcastNotification({
            title,
            message,
            type,
            actionType: "BROADCAST",
            userId: user.id,
            metadata: { broadcast: true },
        });
        notifications.push(notification);
    }
    return notifications;
};
exports.broadcastToUsers = broadcastToUsers;
const getIO = () => {
    return io;
};
exports.getIO = getIO;
//# sourceMappingURL=notificationService.js.map