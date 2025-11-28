"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceRoutes = void 0;
const express_1 = require("express");
const requireRoles_1 = require("../middleware/requireRoles");
const client_1 = require("@prisma/client");
const balanceService_1 = require("../services/balanceService");
const router = (0, express_1.Router)();
exports.balanceRoutes = router;
router.get("/", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                success: false,
                error: "User not authenticated",
            });
            return;
        }
        const balance = await (0, balanceService_1.getMemberBalances)(memberId);
        res.json({
            success: true,
            ...balance,
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=balances.js.map