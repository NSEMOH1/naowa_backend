"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const errorHandler_1 = require("./middleware/errorHandler");
const env_1 = require("./config/env");
const auth_1 = require("./routes/auth");
const user_1 = require("./routes/user");
const loan_1 = require("./routes/loan");
const request_1 = require("./routes/request");
const termination_1 = require("./routes/termination");
const savings_1 = require("./routes/savings");
const report_1 = require("./routes/report");
const balances_1 = require("./routes/balances");
const payment_1 = require("./routes/payment");
const transactions_1 = require("./routes/transactions");
const withdrawal_1 = require("./routes/withdrawal");
const notifications_1 = require("./routes/notifications");
const createApp = () => {
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.config.allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.config.allowedOrigins,
        credentials: true,
    }));
    // const limiter = rateLimit({
    //   windowMs: 15 * 60 * 1000,
    //   max: 100,
    // });
    // app.use(limiter);
    if (env_1.config.nodeEnv !== "test") {
        app.use((0, morgan_1.default)("combined"));
    }
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.get("/health", (req, res) => {
        res.json({ status: "OK", timestamp: new Date().toISOString() });
    });
    app.use("/api", auth_1.authRoutes);
    app.use("/api", user_1.userRoutes);
    app.use("/api/loan", loan_1.loanRoutes);
    app.use("/api/requests", request_1.requestRoutes);
    app.use("/api/termination", termination_1.terminationRoutes);
    app.use("/api/savings", savings_1.savingsRoutes);
    app.use("/api/admin-report", report_1.adminReportRoutes);
    app.use("/api/balances", balances_1.balanceRoutes);
    app.use("/api/payments", payment_1.paymentRoutes);
    app.use("/api/withdrawal", withdrawal_1.withdrawalRoutes);
    app.use("/api/notifications", notifications_1.notificationRoutes);
    app.use("/api/transactions", transactions_1.transactionRoutes);
    app.use(/.*/, (req, res) => {
        res.status(404).json({ error: "Route not found" });
    });
    app.use(errorHandler_1.errorHandler);
    return { app, httpServer };
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map