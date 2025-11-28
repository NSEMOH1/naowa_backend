"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberBalances = void 0;
const database_1 = require("../config/database");
const getMemberBalances = async (memberId) => {
    const balance = await database_1.prisma.balances.findUnique({
        where: { memberId: memberId },
        select: {
            id: true,
            loan_balance: true,
            savings_balance: true,
        },
    });
    return balance;
};
exports.getMemberBalances = getMemberBalances;
//# sourceMappingURL=balanceService.js.map