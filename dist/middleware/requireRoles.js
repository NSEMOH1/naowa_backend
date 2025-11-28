"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = void 0;
const jwt_1 = require("../utils/jwt");
const requireRoles = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                res.status(401).json({ message: "No token provided" });
                return;
            }
            const decoded = (0, jwt_1.verifyToken)(token);
            if (!allowedRoles.includes(decoded.role)) {
                res.status(403).json({
                    message: "Insufficient permissions",
                });
                return;
            }
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(401).json({ message: "Invalid token" });
        }
    };
};
exports.requireRoles = requireRoles;
//# sourceMappingURL=requireRoles.js.map