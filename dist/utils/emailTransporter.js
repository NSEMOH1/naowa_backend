"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Your OTP Code for NAOWA",
        text: `Your OTP code is ${otp}`,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("OTP sent to:", email);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send OTP");
    }
};
exports.sendOTPEmail = sendOTPEmail;
//# sourceMappingURL=emailTransporter.js.map