import dotenv from "dotenv";
import crypto from "crypto";
import { Router } from "express";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";
import { AuthenticatedRequest } from "../types";
import { Response, NextFunction } from "express";
import {
  createPaymentIntent,
  processPayment,
  verifyPaystackTransaction,
} from "../services/paymentService";

const router = Router();
dotenv.config();

router.post(
  "/initialize",
  requireRoles([Role.MEMBER]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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

      const paymentIntent = await createPaymentIntent({
        memberId,
        paymentType,
        amount,
      });

      res.status(200).json({
        success: true,
        data: paymentIntent,
      });
      return;
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to initialize payment",
        message: error.message,
      });
      next(error);
    }
  }
);

router.get(
  "/verify/:reference",
  requireRoles([Role.MEMBER]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { reference } = req.params;
      const memberId = req.user?.id;

      if (!memberId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const verification = await verifyPaystackTransaction(reference, memberId);

      res.status(200).json({
        success: true,
        data: verification,
      });
      return;
    } catch (error: any) {
      console.error("Payment verification error:", error);
      res.status(500).json({
        error: "Failed to verify payment",
        message: error.message,
      });
      next(error);
    }
  }
);

router.post(
  "/webhook",
  requireRoles([Role.MEMBER]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const hash = crypto
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

        await processPayment({
          reference,
          amount: amount / 100,
          metadata,
        });
      }

      res.status(200).json({ success: true });
      return;
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
      next(error);
      return;
    }
  }
);

export { router as paymentRoutes };
