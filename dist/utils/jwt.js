"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const validExpirationTimes = ["1h", "7d", "30d"];
const validateExpirationTime = (expiresIn) => {
    if (validExpirationTimes.includes(expiresIn)) {
        return expiresIn;
    }
    return "1h";
};
const generateToken = (payload) => {
    const expirationTime = validateExpirationTime(env_1.config.jwtExpiresIn);
    const options = {
        expiresIn: expirationTime,
        issuer: "NAOWA-backend",
        audience: "NAOWA-users",
    };
    return jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret, options);
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret, {
            issuer: "NAOWA-backend",
            audience: "NAOWA-users",
        });
    }
    catch (error) {
        throw new Error("Invalid or expired token");
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map