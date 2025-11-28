"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredOtps = exports.updatePassword = exports.verifyResetOtp = exports.sendPasswordResetOtp = exports.changePassword = exports.authenticateUser = exports.authenticateMember = void 0;
const userService_1 = require("./userService");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
const emailTransporter_1 = require("../utils/emailTransporter");
const functions_1 = require("../utils/functions");
const authenticateMember = async (loginData) => {
    const member = await (0, userService_1.findMemberByUsername)(loginData.username);
    if (!member) {
        throw new Error("Invalid credentials");
    }
    if (!member.password) {
        throw new Error("Account not activated. Please contact administrator for password setup.");
    }
    // if (member.status === "INACTIVE") {
    //   throw new Error(
    //     "Your account has is not active. Please contact the administrator."
    //   );
    // }
    const isPasswordValid = await (0, password_1.comparePasswords)(loginData.password, member.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }
    const token = (0, jwt_1.generateToken)({
        id: member.id,
        role: member.role,
    });
    return {
        token,
        user: {
            id: member.id,
            email: member.email,
            full_name: member.full_name,
            role: member.role,
        },
    };
};
exports.authenticateMember = authenticateMember;
const authenticateUser = async (loginData) => {
    const user = await (0, userService_1.findUserByEmail)(loginData.email);
    if (!user) {
        throw new Error("Invalid credentials");
    }
    if (!user.password) {
        throw new Error("Password is required");
    }
    if (user.status === client_1.UserStatus.INACTIVE) {
        throw new Error("You have been suspended, your account is currently inactive");
    }
    const isPasswordValid = await (0, password_1.comparePasswords)(loginData.password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }
    const token = (0, jwt_1.generateToken)({
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
    });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
        },
    };
};
exports.authenticateUser = authenticateUser;
const changePassword = async (data) => {
    try {
        const member = await database_1.prisma.member.findUnique({
            where: { id: data.memberId },
        });
        if (!member || !member.password) {
            throw new Error("User not found");
        }
        const isOldPasswordValid = await (0, password_1.comparePasswords)(data.oldPassword, member.password);
        if (!isOldPasswordValid) {
            throw new Error("Current password is incorrect");
        }
        const hashedNewPassword = await (0, password_1.hashPassword)(data.newPassword);
        await database_1.prisma.member.update({
            where: { id: data.memberId },
            data: {
                password: hashedNewPassword,
            },
        });
        return {
            success: true,
            message: "Password changed successfully",
        };
    }
    catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
};
exports.changePassword = changePassword;
const sendPasswordResetOtp = async (email) => {
    const [member, user] = await Promise.all([
        database_1.prisma.member.findUnique({ where: { email } }),
        database_1.prisma.user.findUnique({ where: { email } }),
    ]);
    if (!member && !user) {
        throw new Error("Email not found");
    }
    const otp = (0, functions_1.generateOTP)();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const isMember = !!member;
    const userId = member ? member.id : user?.id;
    if (!userId) {
        throw new Error("User ID not found");
    }
    await database_1.prisma.passwordReset.deleteMany({
        where: { email },
    });
    await database_1.prisma.passwordReset.create({
        data: {
            email,
            token: otp,
            expiresAt,
            used: false,
            userType: isMember ? client_1.Role.MEMBER : user?.role || client_1.Role.STAFF,
            ...(isMember && { memberId: member.id }),
        },
    });
    await (0, emailTransporter_1.sendOTPEmail)(email, otp);
    return { success: true, message: "OTP sent successfully" };
};
exports.sendPasswordResetOtp = sendPasswordResetOtp;
const verifyResetOtp = async (email, otp) => {
    const record = await database_1.prisma.passwordReset.findFirst({
        where: {
            email,
            token: otp,
            expiresAt: { gt: new Date() },
            used: false,
        },
    });
    if (!record) {
        throw new Error("Invalid or expired OTP");
    }
    return {
        success: true,
        isMember: record.userType === client_1.Role.MEMBER,
        message: "OTP verified successfully",
    };
};
exports.verifyResetOtp = verifyResetOtp;
const updatePassword = async (email, newPassword, isMember) => {
    if (!newPassword || newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }
    const hashedPassword = await (0, password_1.hashPassword)(newPassword);
    await database_1.prisma.$transaction(async (tx) => {
        if (isMember) {
            await tx.member.update({
                where: { email },
                data: { password: hashedPassword },
            });
        }
        else {
            await tx.user.update({
                where: { email },
                data: { password: hashedPassword },
            });
        }
        await tx.passwordReset.updateMany({
            where: { email },
            data: { used: true },
        });
    });
    return { success: true, message: "Password updated successfully" };
};
exports.updatePassword = updatePassword;
const cleanupExpiredOtps = async () => {
    await database_1.prisma.passwordReset.deleteMany({
        where: {
            OR: [{ expiresAt: { lt: new Date() } }, { used: true }],
        },
    });
};
exports.cleanupExpiredOtps = cleanupExpiredOtps;
//# sourceMappingURL=authService.js.map