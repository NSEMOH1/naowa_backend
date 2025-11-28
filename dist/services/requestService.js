"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRequests = exports.rejectRequest = exports.approveRequest = exports.sendRequest = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const sendRequest = async (data) => {
    const request = await database_1.prisma.request.create({
        data: {
            reason: data.reason,
            amount: parseFloat(data.amount),
            memberId: data.memberId,
        },
    });
    return request;
};
exports.sendRequest = sendRequest;
const approveRequest = async (data) => {
    const result = await database_1.prisma.$transaction(async (tx) => {
        const updatedRequest = await tx.request.update({
            where: { id: data.requestId },
            data: {
                status: client_1.RequestStatus.APPROVED,
                updatedAt: new Date(),
            },
        });
        return { updatedRequest };
    });
    return {
        success: true,
        request: result.updatedRequest,
        message: "Request approved successfully",
    };
};
exports.approveRequest = approveRequest;
const rejectRequest = async (data) => {
    const result = await database_1.prisma.$transaction(async (tx) => {
        const updatedRequest = await tx.request.update({
            where: { id: data.requestId },
            data: {
                status: client_1.RequestStatus.REJECTED,
                updatedAt: new Date(),
            },
        });
        return { updatedRequest };
    });
    return {
        success: true,
        request: result.updatedRequest,
        message: "Request rejected successfully",
    };
};
exports.rejectRequest = rejectRequest;
const getAllRequests = async (startDate, endDate) => {
    const requests = await database_1.prisma.request.findMany({
        where: {
            ...(startDate && endDate
                ? {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                }
                : {}),
        },
        select: {
            id: true,
            reason: true,
            amount: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            member: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return {
        success: true,
        count: requests.length,
        requests,
        ...(startDate && endDate
            ? { period: { start: startDate, end: endDate } }
            : {}),
    };
};
exports.getAllRequests = getAllRequests;
//# sourceMappingURL=requestService.js.map