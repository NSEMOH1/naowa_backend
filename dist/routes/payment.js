"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const express_1 = require("express");
const requireRoles_1 = require("../middleware/requireRoles");
const client_1 = require("@prisma/client");
const paymentService_1 = require("../services/paymentService");
const router = (0, express_1.Router)();
exports.paymentRoutes = router;
dotenv_1.default.config();
router.post("/initialize", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const { paymentType, amount } = req.body;
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!paymentType || !amount || amount <= 0) {
            res.status(400).json({
                error: "Payment type and valid amount are required",
            });
            return;
        }
        if (!["SAVINGS_DEPOSIT", "LOAN_REPAYMENT"].includes(paymentType)) {
            res.status(400).json({
                error: "Invalid payment type",
            });
            return;
        }
        const paymentIntent = await (0, paymentService_1.createPaymentIntent)({
            memberId,
            paymentType,
            amount,
        });
        res.status(200).json({
            success: true,
            data: paymentIntent,
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            error: "Failed to initialize payment",
            message: error.message,
        });
        next(error);
    }
});
router.get("/verify/:reference", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const { reference } = req.params;
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const verification = await (0, paymentService_1.verifyPaystackTransaction)(reference, memberId);
        res.status(200).json({
            success: true,
            data: verification,
        });
        return;
    }
    catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({
            error: "Failed to verify payment",
            message: error.message,
        });
        next(error);
    }
});
router.post("/webhook", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const hash = crypto_1.default
            .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
            .update(JSON.stringify(req.body))
            .digest("hex");
        if (hash !== req.headers["x-paystack-signature"]) {
            res.status(401).json({ error: "Invalid signature" });
            return;
        }
        const event = req.body;
        if (event.event === "charge.success") {
            const { reference, amount, metadata } = event.data;
            await (0, paymentService_1.processPayment)({
                reference,
                amount: amount / 100,
                metadata,
            });
        }
        res.status(200).json({ success: true });
        return;
    }
    catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ error: "Webhook processing failed" });
        next(error);
        return;
    }
});
//# sourceMappingURL=payment.js.map