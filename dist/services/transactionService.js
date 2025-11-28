"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = void 0;
const database_1 = require("../config/database");
const getTransactions = async ({ memberId, startDate, endDate, }) => {
    const where = {
        memberId: memberId,
    };
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
            where.createdAt.lte = new Date(endDate);
        }
    }
    const transactions = await database_1.prisma.transaction.findMany({
        where,
        orderBy: {
            createdAt: "desc",
        },
    });
    return transactions || [];
};
exports.getTransactions = getTransactions;
//# sourceMappingURL=transactionService.js.map