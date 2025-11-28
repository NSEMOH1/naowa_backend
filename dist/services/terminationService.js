"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTerminations = exports.requestTermination = void 0;
const database_1 = require("../config/database");
const requestTermination = async (data) => {
    if (!data.reason)
        throw new Error("Reason for termination is required");
    const result = await database_1.prisma.termination.create({
        data: {
            memberId: data.memberId,
            reason: data.reason,
        },
    });
    return result;
};
exports.requestTermination = requestTermination;
const getAllTerminations = async (page = 1, limit = 10, startDate, endDate) => {
    const skip = (page - 1) * limit;
    const whereClause = {};
    if (startDate && endDate) {
        whereClause.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }
    const total = await database_1.prisma.termination.count({
        where: whereClause,
    });
    const result = await database_1.prisma.termination.findMany({
        where: whereClause,
        include: {
            member: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take: limit,
    });
    if (!result || result.length === 0) {
        return {
            success: true,
            message: "No Termination Request found",
            data: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
        };
    }
    return {
        data: result,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
exports.getAllTerminations = getAllTerminations;
//# sourceMappingURL=terminationService.js.map