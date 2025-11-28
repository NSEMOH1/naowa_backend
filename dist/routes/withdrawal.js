"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalRoutes = void 0;
const express_1 = require("express");
const requireRoles_1 = require("../middleware/requireRoles");
const client_1 = require("@prisma/client");
const withdrawalService_1 = require("../services/withdrawalService");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
exports.withdrawalRoutes = router;
router.post("/", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const savingsData = req.body;
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                error: "Member not authenticated",
            });
            return;
        }
        const data = await (0, withdrawalService_1.requestWithdrawal)({
            ...savingsData,
            memberId: memberId,
        });
        // TODO: Send notification to admins about new withdrawal request
        // TODO: Send confirmation to member
        // await notifyWithdrawalRequest(
        //   memberId,
        //   data.id,
        //   data.amount.toString(),
        //   data.reference,
        //   `Withdrawal request for ${savingsData.category_name} savings`
        // );
        res.status(201).json({
            success: true,
            message: "Withdrawal request submitted successfully",
            data: data,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/member", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        const status = req.query.status;
        if (!memberId) {
            res.status(401).json({
                error: "Member not authenticated",
            });
            return;
        }
        const withdrawals = await (0, withdrawalService_1.getMemberWithdrawals)(memberId, status);
        res.status(200).json({
            success: true,
            data: withdrawals,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/member/:id", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        const withdrawalId = req.params.id;
        if (!memberId) {
            res.status(401).json({
                error: "Member not authenticated",
            });
            return;
        }
        const withdrawal = await (0, withdrawalService_1.getWithdrawalByReference)(withdrawalId);
        if (withdrawal.memberId !== memberId) {
            res.status(403).json({
                error: "Unauthorized to view this withdrawal",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: withdrawal,
        });
    }
    catch (error) {
        next(error);
    }
});
router.patch("/:id/cancel", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        const withdrawalId = req.params.id;
        if (!memberId) {
            res.status(401).json({
                error: "Member not authenticated",
            });
            return;
        }
        const data = await (0, withdrawalService_1.cancelWithdrawal)(withdrawalId, memberId);
        res.status(200).json({
            success: true,
            message: "Withdrawal request cancelled successfully",
            data: data,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/pending", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const withdrawals = await (0, withdrawalService_1.getPendingWithdrawals)();
        res.status(200).json({
            success: true,
            data: withdrawals,
        });
    }
    catch (error) {
        next(error);
    }
});
router.patch("/:id/approve", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const adminId = req.user?.id;
        const withdrawalId = req.params.id;
        if (!adminId) {
            res.status(401).json({
                error: "Admin not authenticated",
            });
            return;
        }
        const data = await (0, withdrawalService_1.approveWithdrawal)({
            withdrawalId,
            approvedBy: adminId,
        });
        // TODO: Send approval notification to member
        // await notifyWithdrawalApproval(
        //   data.memberId,
        //   data.id,
        //   data.amount.toString(),
        //   data.reference,
        //   `Your withdrawal request has been approved`
        // );
        res.status(200).json({
            success: true,
            message: "Withdrawal approved and processed successfully",
            data: data,
        });
    }
    catch (error) {
        next(error);
    }
});
router.patch("/admin/withdrawals/:id/reject", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const adminId = req.user?.id;
        const withdrawalId = req.params.id;
        const { rejectionReason } = req.body;
        if (!adminId) {
            res.status(401).json({
                error: "Admin not authenticated",
            });
            return;
        }
        if (!rejectionReason || rejectionReason.trim() === "") {
            res.status(400).json({
                error: "Rejection reason is required",
            });
            return;
        }
        const data = await (0, withdrawalService_1.rejectWithdrawal)({
            withdrawalId,
            rejectedBy: adminId,
            rejectionReason,
        });
        // TODO: Send rejection notification to member
        // await notifyWithdrawalRejection(
        //   data.memberId,
        //   data.id,
        //   data.amount.toString(),
        //   data.reference,
        //   rejectionReason,
        //   `Your withdrawal request has been rejected`
        // );
        res.status(200).json({
            success: true,
            message: "Withdrawal rejected",
            data: data,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/admin/withdrawals/reference/:reference", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const reference = req.params.reference;
        const withdrawal = await (0, withdrawalService_1.getWithdrawalByReference)(reference);
        res.status(200).json({
            success: true,
            data: withdrawal,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/admin", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const status = req.query.status;
        const withdrawals = await database_1.prisma.withdrawal.findMany({
            where: status ? { status } : {},
            include: {
                member: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: {
                requestedAt: "desc",
            },
        });
        res.status(200).json({
            success: true,
            data: withdrawals,
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=withdrawal.js.map