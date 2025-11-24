import { Router } from "express";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";
import { AuthenticatedRequest } from "../types";
import { Response, NextFunction } from "express";
import { getMemberBalances } from "../services/balanceService";

const router = Router();

router.get(
  "/",
  requireRoles([Role.MEMBER]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const memberId = req.user?.id;

      if (!memberId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      const balance = await getMemberBalances(memberId);

      res.json({
        success: true,
        ...balance,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as balanceRoutes };
