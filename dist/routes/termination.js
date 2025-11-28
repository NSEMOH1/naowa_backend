"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminationRoutes = void 0;
const client_1 = require("@prisma/client");
const requireRoles_1 = require("../middleware/requireRoles");
const express_1 = require("express");
const terminationService_1 = require("../services/terminationService");
const router = (0, express_1.Router)();
exports.terminationRoutes = router;
router.post("/", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const { reason } = req.body;
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                error: "Member not authenticated",
            });
            return;
        }
        const request = await (0, terminationService_1.requestTermination)({ reason, memberId });
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
router.get("/", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const request = await (0, terminationService_1.getAllTerminations)();
        res.json({
            success: true,
            ...request,
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=termination.js.map