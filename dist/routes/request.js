"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestRoutes = void 0;
const express_1 = require("express");
const requireRoles_1 = require("../middleware/requireRoles");
const client_1 = require("@prisma/client");
const requestService_1 = require("../services/requestService");
const router = (0, express_1.Router)();
exports.requestRoutes = router;
router.post("/", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const { reason, amount } = req.body;
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                error: "Member not authenticated",
            });
            return;
        }
        const request = await (0, requestService_1.sendRequest)({ reason, amount, memberId });
        res.json({
            success: true,
            message: "Request Sent Successfully",
            ...request,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/:id/approve", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { id: requestId } = req.params;
        if (!requestId) {
            res.status(401).json({
                error: "Request ID is required",
            });
            return;
        }
        const request = await (0, requestService_1.approveRequest)({ requestId });
        res.json({
            ...request,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/:id/reject", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { id: requestId } = req.params;
        if (!requestId) {
            res.status(401).json({
                error: "Request ID is required",
            });
            return;
        }
        const request = await (0, requestService_1.rejectRequest)({ requestId });
        res.json({
            ...request,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const request = await (0, requestService_1.getAllRequests)(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        res.json({
            ...request,
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=request.js.map