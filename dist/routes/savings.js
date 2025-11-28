"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savingsRoutes = void 0;
const express_1 = require("express");
const requireRoles_1 = require("../middleware/requireRoles");
const client_1 = require("@prisma/client");
const savingService_1 = require("../services/savingService");
// import {
//   notifySavingsDeposit,
//   notifyTransaction,
// } from "../services/notificationService";
const database_1 = require("../config/database");
const functions_1 = require("../utils/functions");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
exports.savingsRoutes = router;
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 1 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes("excel") ||
            file.mimetype.includes("spreadsheet")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only Excel files are allowed"));
        }
    },
});
router.post("/deposit", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const savingsData = req.body;
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                error: "User not authenticated",
            });
            return;
        }
        const data = await (0, savingService_1.addSavings)({
            ...savingsData,
            memberId: memberId,
        });
        //   await notifySavingsDeposit(
        //     memberId,
        //     data.id,
        //     savingsData.amount.toString(),
        //     savingsData.category_name
        //   );
        //   await notifyTransaction(
        //     memberId,
        //     data.id,
        //     savingsData.amount.toString(),
        //     "SAVINGS_DEPOSIT",
        //     `${savingsData.category_name} savings deposit`
        //   );
        res.status(201).json({
            success: true,
            data: data,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/balances", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                error: "User not authenticated",
            });
            return;
        }
        const balance = await (0, savingService_1.getSavingsBalance)(memberId);
        res.json({
            success: true,
            data: balance,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/withdraw", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const savingsData = req.body;
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                error: "Member not authenticated",
            });
            return;
        }
        const data = await (0, savingService_1.withdrawSavings)({
            ...savingsData,
            memberId: memberId,
        });
        //   await notifyTransaction(
        //     memberId,
        //     data.id,
        //     savingsData.amount.toString(),
        //     "SAVINGS_WITHDRAWAL",
        //     `${savingsData.category_name} savings withdrawal`
        //   );
        res.status(201).json({
            success: true,
            data: data,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put("/deduction", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const { amount } = req.body;
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                error: "Member not authenticated",
            });
            return;
        }
        const data = await (0, savingService_1.editDeduction)(amount, memberId);
        res.status(201).json({
            success: true,
            data: data,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const data = await (0, savingService_1.getAllSavings)();
        res.status(201).json({
            success: true,
            ...data,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/total-savings", (0, requireRoles_1.requireRoles)([client_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                error: "Member not authenticated",
            });
            return;
        }
        const data = await (0, savingService_1.getMemberTotalSavings)(memberId);
        res.status(201).json({
            success: true,
            data,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/upload/cooperative-savings", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), upload.single("file"), async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                error: "No file uploaded",
            });
            return;
        }
        console.log(req.file);
        if (!req.file.buffer || req.file.buffer.length === 0) {
            res.status(400).json({
                success: false,
                error: "Uploaded file is empty",
            });
            return;
        }
        const isExcel = req.file.buffer.subarray(0, 2).toString() === "PK";
        if (!isExcel) {
            res.status(400).json({
                success: false,
                error: "File is not a valid Excel format",
            });
            return;
        }
        const uploadType = req.body.uploadType || "MONTHLY DEDUCTIONS";
        const uploadedBy = req.user?.id;
        const result = await (0, savingService_1.uploadCooperativeSavingsFromExcel)(req.file.buffer, uploadedBy);
        await database_1.prisma.uploadLog.create({
            data: {
                fileName: req.file.originalname,
                uploadType: uploadType,
                processedItems: result.processedCount,
                failedItems: result.errorCount,
                totalAmount: result.summary.totalAmount,
                status: result.success ? "COMPLETED" : "FAILED",
                uploadedById: uploadedBy,
                processingTime: new Date(),
                errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
            },
        });
        res.json({
            success: result.success,
            processedCount: result.processedCount,
            errorCount: result.errorCount,
            summary: result.summary,
            errors: result.errors,
            message: result.success
                ? `Successfully processed ${result.processedCount} records`
                : `Upload completed with ${result.errorCount} errors`,
        });
    }
    catch (error) {
        console.error("Upload error:", error);
        if (req.file && req.user?.id) {
            try {
                await database_1.prisma.uploadLog.create({
                    data: {
                        fileName: req.file.originalname,
                        uploadType: req.body.uploadType || "MONTHLY DEDUCTIONS",
                        processedItems: 0,
                        failedItems: 0,
                        totalAmount: 0,
                        status: "FAILED",
                        uploadedById: req.user.id,
                        processingTime: new Date(),
                        errors: JSON.stringify([
                            {
                                error: error instanceof Error ? error.message : "Unknown error",
                            },
                        ]),
                    },
                });
            }
            catch (logError) {
                console.error("Failed to log upload error:", logError);
            }
        }
        next(error);
    }
});
router.get("/logs", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        const [logs, total] = await Promise.all([
            database_1.prisma.uploadLog.findMany({
                where,
                include: {
                    uploadedBy: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
            }),
            database_1.prisma.uploadLog.count({ where }),
        ]);
        const formattedLogs = logs.map((log) => ({
            id: log.id,
            fileName: log.fileName,
            uploadType: log.uploadType,
            processedTime: log.processingTime
                ? (0, functions_1.calculateProcessingTime)(log.createdAt, log.processingTime)
                : "N/A",
            processedItems: log.processedItems,
            failedItems: log.failedItems,
            totalAmount: log.totalAmount,
            status: log.status,
            date: log.createdAt,
            uploadedBy: log.uploadedBy
                ? {
                    id: log.uploadedBy.id,
                    name: log.uploadedBy.full_name,
                    email: log.uploadedBy.email,
                }
                : null,
            errors: log.errors ? JSON.parse(log.errors) : [],
        }));
        res.json({
            success: true,
            data: formattedLogs,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        });
    }
    catch (error) {
        next(error);
    }
});
router.get("/logs/:id", (0, requireRoles_1.requireRoles)([client_1.Role.ADMIN]), async (req, res, next) => {
    try {
        const { id } = req.params;
        const log = await database_1.prisma.uploadLog.findUnique({
            where: { id },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
            },
        });
        if (!log) {
            res.status(404).json({
                success: false,
                error: "Upload log not found",
            });
            return;
        }
        res.json({
            success: true,
            data: {
                ...log,
                errors: log.errors ? JSON.parse(log.errors) : [],
            },
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=savings.js.map