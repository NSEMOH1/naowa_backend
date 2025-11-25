import { NextFunction, Router, Response } from "express";
import { requireRoles } from "../middleware/requireRoles";
import { Role, WithdrawalStatus } from "@prisma/client";
import { AuthenticatedRequest, IRejectWithdrawal, IWithdrawSavings } from "../types";
import { approveWithdrawal, cancelWithdrawal, getMemberWithdrawals, getPendingWithdrawals, getWithdrawalByReference, rejectWithdrawal, requestWithdrawal } from "../services/withdrawalService";
import { prisma } from "../config/database";

const router = Router();

router.post(
  "/",
  requireRoles([Role.MEMBER]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const savingsData: IWithdrawSavings = req.body;
      const memberId = req.user?.id;

      if (!memberId) {
        res.status(401).json({
          error: "Member not authenticated",
        });
        return;
      }

      const data = await requestWithdrawal({
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
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/member",
  requireRoles([Role.MEMBER]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const memberId = req.user?.id;
      const status = req.query.status as WithdrawalStatus | undefined;

      if (!memberId) {
        res.status(401).json({
          error: "Member not authenticated",
        });
        return;
      }

      const withdrawals = await getMemberWithdrawals(memberId, status);

      res.status(200).json({
        success: true,
        data: withdrawals,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/member/:id",
  requireRoles([Role.MEMBER]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const memberId = req.user?.id;
      const withdrawalId = req.params.id;

      if (!memberId) {
        res.status(401).json({
          error: "Member not authenticated",
        });
        return;
      }

      const withdrawal = await getWithdrawalByReference(withdrawalId);

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
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id/cancel",
  requireRoles([Role.MEMBER]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const memberId = req.user?.id;
      const withdrawalId = req.params.id;

      if (!memberId) {
        res.status(401).json({
          error: "Member not authenticated",
        });
        return;
      }

      const data = await cancelWithdrawal(withdrawalId, memberId);

      res.status(200).json({
        success: true,
        message: "Withdrawal request cancelled successfully",
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/pending",
  requireRoles([Role.ADMIN]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const withdrawals = await getPendingWithdrawals();

      res.status(200).json({
        success: true,
        data: withdrawals,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id/approve",
  requireRoles([Role.ADMIN]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminId = req.user?.id;
      const withdrawalId = req.params.id;

      if (!adminId) {
        res.status(401).json({
          error: "Admin not authenticated",
        });
        return;
      }

      const data = await approveWithdrawal({
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
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/admin/withdrawals/:id/reject",
  requireRoles([Role.ADMIN]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminId = req.user?.id;
      const withdrawalId = req.params.id;
      const { rejectionReason }: IRejectWithdrawal = req.body;

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

      const data = await rejectWithdrawal({
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
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/admin/withdrawals/reference/:reference",
  requireRoles([Role.ADMIN]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const reference = req.params.reference;

      const withdrawal = await getWithdrawalByReference(reference);

      res.status(200).json({
        success: true,
        data: withdrawal,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/admin",
  requireRoles([Role.ADMIN]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const status = req.query.status as WithdrawalStatus;

      const withdrawals = await prisma.withdrawal.findMany({
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
    } catch (error) {
      next(error);
    }
  }
);

export { router as withdrawalRoutes };
