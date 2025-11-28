"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const userService_1 = require("../services/userService");
const requireRoles_1 = require("../middleware/requireRoles");
const prisma_1 = require("../generated/prisma");
// import { validateBody } from "../middleware/validateBody";
// import { pinSchema } from "../utils/validators/auth";
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
exports.userRoutes = router;
router.delete("/member/:id", (0, requireRoles_1.requireRoles)([prisma_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "Member ID is required" });
            return;
        }
        const deletedUser = await (0, userService_1.deleteMember)(id);
        res.status(200).json({
            message: "User deleted successfully",
            id: deletedUser.id,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put("/member/:id", (0, requireRoles_1.requireRoles)([prisma_1.Role.MEMBER, prisma_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { id } = req.params;
        const memberData = req.body;
        if (!id) {
            res.status(400).json({ message: "Member ID is required" });
            return;
        }
        if (Object.keys(memberData).length === 0) {
            res.status(400).json({ message: "No update data provided" });
            return;
        }
        let updateData = { ...memberData };
        const updatedMember = await (0, userService_1.updateMember)(id, updateData);
        res.status(200).json({
            message: "Member updated successfully",
            user: updatedMember,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/members", (0, requireRoles_1.requireRoles)([prisma_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { page = "1", limit = "10", search = "", sortBy = "created_at", sortOrder = "desc", role, status, createdAfter, createdBefore, } = req.query;
        const result = await (0, userService_1.getAllMembers)({
            page: parseInt(page),
            limit: parseInt(limit),
            search: search,
            sortBy: sortBy,
            sortOrder: sortOrder,
            role: role,
            status: status,
            createdAfter: createdAfter
                ? new Date(createdAfter)
                : undefined,
            createdBefore: createdBefore
                ? new Date(createdBefore)
                : undefined,
        });
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/members/:id", (0, requireRoles_1.requireRoles)([prisma_1.Role.MEMBER, prisma_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await (0, userService_1.findMemberById)(id);
        res.status(200).json({
            success: true,
            user: user,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/members/:id/savings", (0, requireRoles_1.requireRoles)([prisma_1.Role.MEMBER, prisma_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const savings = await database_1.prisma.saving.findMany({
            where: { memberId: req.params.id },
            orderBy: { createdAt: "desc" },
        });
        res.json(savings);
    }
    catch (error) {
        next(error);
    }
});
router.get("/members/:id/loans", (0, requireRoles_1.requireRoles)([prisma_1.Role.MEMBER, prisma_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const loans = await database_1.prisma.loan.findMany({
            where: { memberId: req.params.id },
            orderBy: { createdAt: "desc" },
            include: { repayments: true },
        });
        res.json(loans);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching loan history" });
    }
});
router.put("/users/:id", (0, requireRoles_1.requireRoles)([prisma_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const userData = req.body;
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                message: "User ID is required",
            });
            return;
        }
        const updatedUser = await (0, userService_1.updateUser)(id, userData);
        res.json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
});
router.delete("/users/:id", (0, requireRoles_1.requireRoles)([prisma_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "User ID is required" });
            return;
        }
        const deletedUser = await (0, userService_1.deleteUser)(id);
        res.status(200).json({
            message: "User deleted successfully",
            id: deletedUser.id,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/members/:memberId/approve", (0, requireRoles_1.requireRoles)([prisma_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const adminId = req.user?.id;
        if (!memberId) {
            res.status(400).json({ message: "Member ID is required" });
            return;
        }
        if (!adminId) {
            res.status(401).json({
                error: "User not authenticated",
            });
            return;
        }
        const approvedMember = await (0, userService_1.approveMember)({ memberId });
        res.status(200).json({
            message: "Member approved successfully",
            id: approvedMember.id,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/members/:memberId/reject", (0, requireRoles_1.requireRoles)([prisma_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { memberId } = req.params;
        if (!memberId) {
            res.status(400).json({ message: "Member ID is required" });
            return;
        }
        const rejectedMember = await (0, userService_1.rejectMember)({ memberId });
        res.status(200).json({
            message: "Member rejected successfully",
            id: rejectedMember.id,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/member/change-pin", (0, requireRoles_1.requireRoles)([prisma_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        const { pin } = req.body;
        if (!memberId) {
            res.status(400).json({ message: "Member ID is required" });
            return;
        }
        const result = await (0, userService_1.changePin)(pin, memberId);
        res.json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/users", (0, requireRoles_1.requireRoles)([prisma_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { page = "1", limit = "10", search = "", sortBy = "created_at", sortOrder = "desc", role, status, createdAfter, createdBefore, } = req.query;
        const result = await (0, userService_1.getAllUsers)({
            page: parseInt(page),
            limit: parseInt(limit),
            search: search,
            sortBy: sortBy,
            sortOrder: sortOrder,
            role: role,
            status: status,
            createdAfter: createdAfter
                ? new Date(createdAfter)
                : undefined,
            createdBefore: createdBefore
                ? new Date(createdBefore)
                : undefined,
        });
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=user.js.map