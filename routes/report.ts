import { Router } from "express";
import { prisma } from "../config/database";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/financial",
  requireRoles([Role.STAFF, Role.ADMIN]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const report = await prisma.transaction.findMany({
        where: { status: "COMPLETED" },
        include: {
          member: {
            select: {
              full_name: true,
              phone: true,
              bank: {
                select: {
                  account_number: true,
                },
              },
            },
          },
          loan: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formatted = report.map((tx) => {
        const transactionType = tx.loan ? "Loan" : "Savings";

        return {
          fullName: `${tx.member?.full_name ?? ""}`,
          accountNo: tx.member?.bank[0]?.account_number ?? "-",
          debit:
            tx.type.includes("WITHDRAWAL") || tx.type.includes("FEE")
              ? `₦${tx.amount.toFixed(2)}`
              : "-",
          credit:
            tx.type.includes("DEPOSIT") || tx.type.includes("DISBURSEMENT")
              ? `₦${tx.amount.toFixed(2)}`
              : "-",
          date: tx.createdAt.toISOString().split("T")[0],
          status: tx.status,
          type: transactionType,
          amount: `₦${tx.amount.toFixed(2)}`,
        };
      });

      res.json(formatted);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/monthly-deductions",
  requireRoles([Role.STAFF, Role.ADMIN]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const members = await prisma.member.findMany({
        select: {
          full_name: true,
          phone: true,
          monthlyDeduction: true,
          status: true,
          bank: {
            select: {
              account_number: true,
            },
          },
        },
      });

      const result = members.map((m) => ({
        fullName: `${m.full_name}`,
        accountNo: m.bank[0]?.account_number || "-",
        deduction: `₦${m.monthlyDeduction}`,
        status: m.status,
      }));

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/loan-repayments",
  requireRoles([Role.STAFF, Role.ADMIN]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const repayments = await prisma.repayment.findMany({
        include: {
          loan: {
            include: {
              member: true,
            },
          },
        },
      });

      const data = repayments.map((r) => ({
        fullName: `${r.loan.member.full_name}`,
        amount: `₦${r.amount.toFixed(2)}`,
        dueDate: r.dueDate.toISOString().split("T")[0],
        paidAt: r.paidAt ? r.paidAt.toISOString().split("T")[0] : "Not Paid",
        status: r.status,
      }));

      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/dividends",
  requireRoles([Role.STAFF, Role.ADMIN]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dividends = await prisma.transaction.findMany({
        where: {
          type: "ADJUSTMENT",
          description: {
            contains: "dividend",
            mode: "insensitive",
          },
        },
        include: {
          member: true,
        },
      });

      const data = dividends.map((d) => ({
        fullName: `${d.member?.full_name ?? ""}`,
        accountNo: d.member?.phone,
        amount: `₦${d.amount.toFixed(2)}`,
        status: d.status,
      }));

      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/interests",
  requireRoles([Role.STAFF, Role.ADMIN]),
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const interestTx = await prisma.transaction.findMany({
        where: {
          description: {
            contains: "interest",
            mode: "insensitive",
          },
        },
        include: {
          member: true,
        },
      });

      const data = interestTx.map((tx) => ({
        fullName: `${tx.member?.full_name ?? ""}`,
        accountNo: tx.member?.phone,
        amount: `₦${tx.amount.toFixed(2)}`,
        type: tx.type,
        status: tx.status,
      }));

      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

export { router as adminReportRoutes };
