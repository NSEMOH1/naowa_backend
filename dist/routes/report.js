"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminReportRoutes = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const requireRoles_1 = require("../middleware/requireRoles");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.adminReportRoutes = router;
router.get("/financial", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const report = await database_1.prisma.transaction.findMany({
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
                debit: tx.type.includes("WITHDRAWAL") || tx.type.includes("FEE")
                    ? `₦${tx.amount.toFixed(2)}`
                    : "-",
                credit: tx.type.includes("DEPOSIT") || tx.type.includes("DISBURSEMENT")
                    ? `₦${tx.amount.toFixed(2)}`
                    : "-",
                date: tx.createdAt.toISOString().split("T")[0],
                status: tx.status,
                type: transactionType,
                amount: `₦${tx.amount.toFixed(2)}`,
            };
        });
        res.json(formatted);
    }
    catch (err) {
        next(err);
    }
});
router.get("/monthly-deductions", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const members = await database_1.prisma.member.findMany({
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
    }
    catch (err) {
        next(err);
    }
});
router.get("/loan-repayments", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const repayments = await database_1.prisma.repayment.findMany({
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
    }
    catch (err) {
        next(err);
    }
});
router.get("/dividends", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const dividends = await database_1.prisma.transaction.findMany({
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
    }
    catch (err) {
        next(err);
    }
});
router.get("/interests", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const interestTx = await database_1.prisma.transaction.findMany({
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
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=report.js.map