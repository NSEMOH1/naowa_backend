"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const userService_1 = require("../services/userService");
const authService_1 = require("../services/authService");
const requireRoles_1 = require("../middleware/requireRoles");
const prisma_1 = require("../generated/prisma");
const path_1 = __importDefault(require("path"));
const fileUpload_1 = require("../middleware/fileUpload");
const router = (0, express_1.Router)();
exports.authRoutes = router;
router.post("/auth/member/register", fileUpload_1.handleFileUpload, fileUpload_1.multerErrorHandler, async (req, res, next) => {
    try {
        console.log("body", req.body);
        console.log("files", req.files);
        const userData = req.body.data
            ? JSON.parse(req.body.data)
            : req.body;
        const files = req.files;
        const transformedData = {
            ...userData,
            profile_picture: files.profile_picture?.[0]?.filename,
            nin_document: files.nin_document?.[0]?.filename,
        };
        const member = await (0, userService_1.createMember)(transformedData);
        res.status(201).json({
            success: true,
            message: "Member created successfully.",
            data: {
                id: member.id,
                email: member.email,
                name: `${member.full_name}`,
                role: member.role,
                hasPassword: false,
            },
        });
    }
    catch (error) {
        if (req.files) {
            const files = req.files;
            Object.values(files).forEach((fileArray) => {
                fileArray.forEach((file) => {
                    require("fs").unlink(path_1.default.join(__dirname, "../uploads", file.filename), () => { });
                });
            });
        }
        next(error);
    }
});
router.post("/auth/user/register", async (req, res, next) => {
    try {
        const userData = req.body;
        if (!userData) {
            res.status(401).json({
                success: false,
                message: "Please make sure all parameters are sent",
            });
            return;
        }
        await (0, userService_1.createUser)(userData);
        res.json({
            success: true,
            message: "User Created Successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/auth/change-password", (0, requireRoles_1.requireRoles)([prisma_1.Role.ADMIN, prisma_1.Role.MEMBER]), async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const memberId = req.user?.id;
        if (!memberId) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long",
            });
            return;
        }
        await (0, authService_1.changePassword)({
            memberId,
            oldPassword,
            newPassword,
        });
        res.json({
            success: true,
            message: "Password changed successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/auth/member/login", async (req, res, next) => {
    try {
        const loginData = req.body;
        const result = await (0, authService_1.authenticateMember)(loginData);
        res.json({
            success: true,
            message: "Login successful",
            ...result,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("Account not activated")) {
                res.status(403).json({
                    success: false,
                    message: "Account not activated. Please contact administrator.",
                    code: "ACCOUNT_NOT_ACTIVATED",
                });
                return;
            }
            else if (error.message === "Invalid credentials") {
                res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
                return;
            }
        }
        next(error);
    }
});
router.post("/auth/user/login", async (req, res, next) => {
    try {
        const loginData = req.body;
        const result = await (0, authService_1.authenticateUser)(loginData);
        res.json({
            success: true,
            message: "Login successful",
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/auth/verify-email", async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                error: "Email is required",
            });
            return;
        }
        await (0, authService_1.sendPasswordResetOtp)(email);
        res.json({
            success: true,
            message: "If the email exists, an OTP has been sent",
        });
    }
    catch (error) {
        res.json({
            success: true,
            message: "If the email exists, an OTP has been sent",
        });
    }
});
router.post("/auth/verify-otp", async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({
                success: false,
                error: "Email and OTP are required",
            });
            return;
        }
        const result = await (0, authService_1.verifyResetOtp)(email, otp);
        res.json({
            success: true,
            message: "OTP verified successfully",
            data: {
                isMember: result.isMember,
                email,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/auth/reset-password", async (req, res, next) => {
    try {
        const { email, newPassword, isMember } = req.body;
        if (!email || !newPassword || isMember === undefined) {
            res.status(400).json({
                success: false,
                error: "Email, new password, and user type are required",
            });
            return;
        }
        const result = await (0, authService_1.updatePassword)(email, newPassword, isMember);
        res.json({
            success: true,
            message: "Password reset successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=auth.js.map