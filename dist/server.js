"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const startServer = async () => {
    try {
        await database_1.prisma.$connect();
        console.log("✅ Database connected successfully");
        const { httpServer } = (0, app_1.createApp)();
        const port = Number(env_1.config.port);
        httpServer.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
            console.log(`📖 Environment: ${env_1.config.nodeEnv}`);
        });
        process.on("SIGINT", async () => {
            console.log("\n🛑 Shutting down server...");
            await database_1.prisma.$disconnect();
            process.exit(0);
        });
        process.on("exit", async () => {
            await database_1.prisma.$disconnect();
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map