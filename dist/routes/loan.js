"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanRoutes = void 0;
const express_1 = require("express");
const loanService_1 = require("../services/loanService");
const requireRoles_1 = require("../middleware/requireRoles");
const client_1 = require("@prisma/client");
const fileUpload_1 = require("../middleware/fileUpload");
// import {
//     notifyLoanApplication,
//     notifyLoanStatus,
// } from "../services/notificationService";
const router = (0, express_1.Router)();
exports.loanRoutes = router;
router.post("/apply", fileUpload_1.handleFileUpload, (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        console.log("body", req.body);
        console.log("files", req.files);
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
            return;
        }
        const loanData = JSON.parse(req.body.data);
        const files = req.files;
        console.log("files", files);
        const transformedData = {
            ...loanData,
            validId: files.validId?.[0]?.filename,
            nonIndebtedness: files.nonIndebtedness?.[0]?.filename,
            application: files.application?.[0]?.filename,
            incomeProof: files.incomeProof?.[0]?.filename,
            accountStatement: files.accountStatement?.[0]?.filename,
            utilityBill: files.utilityBill?.[0]?.filename,
            guarantorLetter: files.guarantorLetter?.[0]?.filename,
            guarantorPassport: files.guarantorPassport?.[0]?.filename,
            personalPassport: files.personalPassport?.[0]?.filename,
        };
        const result = await (0, loanService_1.applyForLoan)({
            ...transformedData,
            memberId,
        });
        // await notifyLoanApplication(
        //     memberId,
        //     result.loanId,
        //     req.body.amount,
        //     req.body.categoryName
        // );
        res.status(201).json({
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const result = await (0, loanService_1.getAllLoans)();
        res.status(201).json({
            result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/admin-stats", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const adminStats = await (0, loanService_1.getAdminLoanStatistics)();
        res.status(200).json({
            success: true,
            data: adminStats,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/:id/verify", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const { id: loanId } = req.params;
        const memberId = req.user?.id;
        const { otp } = req.body;
        if (!memberId) {
            res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
            return;
        }
        const result = await (0, loanService_1.confirmLoanWithOTP)(loanId, otp, memberId);
        res.json({
            success: true,
            message: "Loan application verified",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/:id/approve", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { id: loanId } = req.params;
        const adminId = req.user?.id;
        if (!adminId) {
            res.status(401).json({
                success: false,
                message: "Admin not authenticated",
            });
            return;
        }
        const result = await (0, loanService_1.approveLoan)({ loanId }, adminId);
        if (!result.loan?.memberId) {
            res.status(401).json({
                success: false,
                message: "No member found",
            });
            return;
        }
        //   await notifyLoanStatus(
        //     result.loan?.memberId,
        //     loanId,
        //     "APPROVED",
        //     adminId,
        //     result.loan?.approvedAmount,
        //     result.loan?.categoryId
        //   );
        if (!result.success) {
            res.status(400).json({
                success: false,
                message: result.error,
            });
            return;
        }
        res.json({
            success: true,
            message: "Loan approved successfully",
            data: result.loan,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/:id/reject", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { id: loanId } = req.params;
        const { rejectionReason } = req.body;
        const adminId = req.user?.id;
        if (!adminId) {
            res.status(401).json({
                success: false,
                message: "Admin not authenticated",
            });
            return;
        }
        const result = await (0, loanService_1.rejectLoan)({
            loanId,
            rejectionReason,
        }, adminId);
        if (!result.loan?.memberId) {
            res.status(401).json({
                success: false,
                message: "No member found",
            });
            return;
        }
        //   await notifyLoanStatus(
        //     result.loan.memberId,
        //     loanId,
        //     "REJECTED",
        //     adminId,
        //     result.loan.amount,
        //     result.loan.categoryId
        //   );
        if (!result.success) {
            res.status(400).json({
                success: false,
                message: result.error,
            });
            return;
        }
        res.json({
            success: true,
            message: "Loan rejected successfully",
            data: result.loan,
            transaction: result.transaction,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/:id/disburse", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { id: loanId } = req.params;
        const adminId = req.user?.id;
        if (!adminId) {
            res.status(401).json({
                success: false,
                message: "Admin not authenticated",
            });
            return;
        }
        const result = await (0, loanService_1.disburseLoan)({
            loanId,
        }, adminId);
        //   await notifyLoanStatus(
        //     result.loan.memberId,
        //     loanId,
        //     "REJECTED",
        //     adminId,
        //     result.loan.amount,
        //     result.loan.categoryId
        //   );
        if (!result.success) {
            res.status(400).json({
                success: false,
                message: result.error,
            });
            return;
        }
        res.json({
            success: true,
            message: "Loan disbursed successfully",
            data: result.loan,
            transaction: result.transaction,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/active", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const loans = await (0, loanService_1.fetchActiveLoans)(memberId);
        res.status(200).json({
            success: true,
            data: loans,
            count: loans.length,
        });
        return;
    }
    catch (error) {
        console.error("Get active loans error:", error);
        res.status(500).json({
            error: "Failed to fetch active loans",
            message: error.message,
        });
    }
});
router.get("/balances", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                success: false,
                error: "User not authenticated",
            });
            return;
        }
        const balances = await (0, loanService_1.getMemberLoanBalance)(memberId);
        res.json({
            success: true,
            ...balances,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/history", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                success: false,
                error: "User not authenticated",
            });
            return;
        }
        const balances = await (0, loanService_1.getMemberLoanHistory)(memberId);
        res.json({
            success: true,
            balances: balances,
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=loan.js.map