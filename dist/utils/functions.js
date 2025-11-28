"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProcessingTime = exports.generateWithdrawalReference = exports.generateLoanReference = exports.generateSavingsReference = exports.verifyOTP = exports.generateOTP = void 0;
const database_1 = require("../config/database");
const generateOTP = () => {
    return Math.floor(10000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
const verifyOTP = async (loanId, userOtp) => {
    const loan = await database_1.prisma.loan.findUnique({
        where: { id: loanId },
        select: { otp: true, otpExpiresAt: true },
    });
    if (!loan || !loan.otp || !loan.otpExpiresAt) {
        return false;
    }
    const now = new Date();
    return loan.otp === userOtp && now < loan.otpExpiresAt;
};
exports.verifyOTP = verifyOTP;
const generateSavingsReference = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SAV-${timestamp}-${random}`;
};
exports.generateSavingsReference = generateSavingsReference;
const generateLoanReference = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `LN-${timestamp}-${random}`;
};
exports.generateLoanReference = generateLoanReference;
const generateWithdrawalReference = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `WTD-${timestamp}-${random}`.toUpperCase();
};
exports.generateWithdrawalReference = generateWithdrawalReference;
const calculateProcessingTime = (startTime, endTime) => {
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    if (diffMins > 0) {
        return `${diffMins}:${diffSecs.toString().padStart(2, "0")} mins`;
    }
    else {
        return `${diffSecs} secs`;
    }
};
exports.calculateProcessingTime = calculateProcessingTime;
//# sourceMappingURL=functions.js.map