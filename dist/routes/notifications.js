"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const notificationService_1 = require("../services/notificationService");
const requireRoles_1 = require("../middleware/requireRoles");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
exports.notificationRoutes = router;
router.get("/member/:memberId", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res) => {
    try {
        const { memberId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const notifications = await prisma.notification.findMany({
            where: { memberId: memberId },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { createdAt: "desc" },
        });
        res.json(notifications);
    }
    catch (error) {
        console.error("Error fetching member notifications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/user/:userId", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { createdAt: "desc" },
            include: {
                member: {
                    select: {
                        full_name: true,
                        username: true,
                    },
                },
            },
        });
        res.json(notifications);
    }
    catch (error) {
        console.error("Error fetching user notifications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.put("/:id/read", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER, client_1.Role.ADMIN]), async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await prisma.notification.update({
            where: { id },
            data: { status: "READ" },
        });
        res.json(notification);
    }
    catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/member/:memberId/unread-count", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER, client_1.Role.ADMIN]), async (req, res) => {
    try {
        const { memberId } = req.params;
        const count = await prisma.notification.count({
            where: {
                memberId,
                status: "UNREAD",
            },
        });
        res.json({ count });
    }
    catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/user/:userId/unread-count", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER, client_1.Role.ADMIN]), async (req, res) => {
    try {
        const { userId } = req.params;
        const count = await prisma.notification.count({
            where: {
                userId,
                status: "UNREAD",
            },
        });
        res.json({ count });
    }
    catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/loan-application", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER, client_1.Role.ADMIN]), async (req, res) => {
    try {
        const { memberId, loanId, amount, categoryName } = req.body;
        const notifications = await (0, notificationService_1.notifyLoanApplication)(memberId, loanId, amount, categoryName);
        res.json({
            message: "Loan application notifications sent",
            notifications,
        });
    }
    catch (error) {
        console.error("Error sending loan application notification:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/loan-status", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER, client_1.Role.ADMIN]), async (req, res) => {
    try {
        const { memberId, loanId, status, userId, amount, categoryName } = req.body;
        const notification = await (0, notificationService_1.notifyLoanStatus)(memberId, loanId, status, userId, amount, categoryName);
        res.json(notification);
    }
    catch (error) {
        console.error("Error sending loan status notification:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/savings-deposit", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER, client_1.Role.ADMIN]), async (req, res) => {
    try {
        const { memberId, savingId, amount, categoryName } = req.body;
        const notifications = await (0, notificationService_1.notifySavingsDeposit)(memberId, savingId, amount, categoryName);
        res.json({
            message: "Savings deposit notifications sent",
            notifications,
        });
    }
    catch (error) {
        console.error("Error sending savings deposit notification:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/member-registration", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER, client_1.Role.ADMIN]), async (req, res) => {
    try {
        const { memberId } = req.body;
        const notifications = await (0, notificationService_1.notifyMemberRegistration)(memberId);
        res.json({
            message: "Member registration notifications sent",
            notifications,
        });
    }
    catch (error) {
        console.error("Error sending member registration notification:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/member-approval", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER, client_1.Role.ADMIN]), async (req, res) => {
    try {
        const { memberId, status, userId } = req.body;
        const notification = await (0, notificationService_1.notifyMemberApproval)(memberId, status, userId);
        res.json(notification);
    }
    catch (error) {
        console.error("Error sending member approval notification:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/transaction", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER, client_1.Role.ADMIN]), async (req, res) => {
    try {
        const { memberId, transactionId, amount, type, description } = req.body;
        const notification = await (0, notificationService_1.notifyTransaction)(memberId, transactionId, amount, type, description);
        res.json(notification);
    }
    catch (error) {
        console.error("Error sending transaction notification:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/broadcast-members", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER, client_1.Role.ADMIN]), async (req, res) => {
    try {
        const { title, message, type = "INFO" } = req.body;
        const notifications = await (0, notificationService_1.broadcastToMembers)(title, message, type);
        res.json({
            message: "Broadcast sent to all members",
            count: notifications.length,
        });
    }
    catch (error) {
        console.error("Error broadcasting to members:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/broadcast-users", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER, client_1.Role.ADMIN]), async (req, res) => {
    try {
        const { title, message, type = "INFO" } = req.body;
        const notifications = await (0, notificationService_1.broadcastToUsers)(title, message, type);
        res.json({
            message: "Broadcast sent to all users",
            count: notifications.length,
        });
    }
    catch (error) {
        console.error("Error broadcasting to users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
//# sourceMappingURL=notifications.js.map