"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionRoutes = void 0;
const express_1 = require("express");
const transactionService_1 = require("../services/transactionService");
const requireRoles_1 = require("../middleware/requireRoles");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.transactionRoutes = router;
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
        const { startDate, endDate } = req.query;
        const transactions = await (0, transactionService_1.getTransactions)({
            memberId,
            startDate: startDate,
            endDate: endDate,
        });
        res.status(200).json({
            success: true,
            data: transactions,
            message: transactions.length === 0
                ? "No transactions found for the selected period"
                : "Transactions retrieved successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=transactions.js.map