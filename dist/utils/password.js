"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomPassword = exports.comparePin = exports.hashAnswer = exports.hashPin = exports.comparePasswords = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, 12);
};
exports.hashPassword = hashPassword;
const comparePasswords = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePasswords = comparePasswords;
const hashPin = async (pin) => {
    return bcryptjs_1.default.hash(pin, 12);
};
exports.hashPin = hashPin;
const hashAnswer = async (answer) => {
    const saltRounds = 10;
    return await bcryptjs_1.default.hash(answer, saltRounds);
};
exports.hashAnswer = hashAnswer;
const comparePin = async (inputPin, hashedPin) => {
    const pinString = inputPin.toString();
    return await bcryptjs_1.default.compare(pinString, hashedPin);
};
exports.comparePin = comparePin;
const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto_1.default.randomInt(0, charset.length);
        password += charset[randomIndex];
    }
    return password;
};
exports.generateRandomPassword = generateRandomPassword;
//# sourceMappingURL=password.js.map