"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerErrorHandler = exports.handleFileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const fs = require("fs").promises;
const storage = multer_1.default.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, "..", "uploads");
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        }
        catch (error) {
            cb(error, "");
            if (req.files) {
                const files = req.files;
                for (const fileArray of Object.values(files)) {
                    for (const file of fileArray) {
                        try {
                            await fs.unlink(path_1.default.join(__dirname, "..", "uploads", file.filename));
                        }
                        catch (unlinkError) {
                            console.error(`Failed to delete file ${file.filename}:`, unlinkError);
                        }
                    }
                }
            }
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${(0, uuid_1.v4)()}`;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed"), false);
    }
};
exports.handleFileUpload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "identification", maxCount: 1 },
    { name: "id_card", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "recommendation", maxCount: 1 },
    { name: "nonIndebtedness", maxCount: 1 },
    { name: "application", maxCount: 1 },
    { name: "validId", maxCount: 1 },
    { name: "incomeProof", maxCount: 1 },
    { name: "accountStatement", maxCount: 1 },
    { name: "utilityBill", maxCount: 1 },
    { name: "guarantorLetter", maxCount: 1 },
    { name: "guarantorPassport", maxCount: 1 },
    { name: "personalPassport", maxCount: 1 },
    { name: "nin_document", maxCount: 1 },
]);
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({
                success: false,
                message: "File size exceeds 5MB limit.",
            });
            return;
        }
        res.status(400).json({
            success: false,
            message: `Multer error: ${err.message}`,
        });
        return;
    }
    next(err);
};
exports.multerErrorHandler = multerErrorHandler;
//# sourceMappingURL=fileUpload.js.map