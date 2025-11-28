"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.changePin = exports.rejectMember = exports.approveMember = exports.getAllMembers = exports.findMemberById = exports.findUserByEmail = exports.findMemberByUsername = exports.deleteMember = exports.updateMember = exports.deleteUser = exports.updateUser = exports.createUser = exports.createMember = void 0;
const prisma_1 = require("../generated/prisma");
const database_1 = require("../config/database");
const password_1 = require("../utils/password");
const client_1 = require("@prisma/client");
const createMember = async (userData) => {
    const hashedPin = await (0, password_1.hashPin)(userData.pin);
    const hashedAnswer = await (0, password_1.hashAnswer)(userData.security_answer);
    const hashedPassword = await (0, password_1.hashPassword)(userData.password);
    return await database_1.prisma.$transaction(async (prisma) => {
        try {
            const memberData = {
                email: userData.email,
                full_name: userData.full_name,
                password: hashedPassword,
                profile_picture: userData.profile_picture,
                nin_document: userData.nin_document,
                gender: userData.gender,
                phone: userData.phone,
                username: userData.username,
                address: userData.address,
                state_of_origin: userData.state_of_origin,
                place_of_work: userData.place_of_work,
                role: prisma_1.Role.MEMBER,
                pin: hashedPin,
                date_of_birth: userData.date_of_birth,
                monthlyDeduction: userData.monthly_deduction || 0,
                marital_status: userData.marital_status,
                spouse_name: userData.spouse_name,
                occupation: userData.occupation,
                bank: {
                    create: {
                        bank_name: userData.bank_name,
                        account_number: userData.account_number,
                        account_name: userData.account_name,
                    },
                },
                next_of_kin: {
                    create: {
                        first_name: userData.kin_first_name,
                        last_name: userData.kin_last_name,
                        email: userData.kin_email,
                        relationship: userData.relationship,
                        phone: userData.kin_phone,
                        gender: userData.kin_gender,
                        address: userData.kin_address,
                    },
                },
                security: {
                    create: {
                        question: userData.security_question,
                        answer: hashedAnswer,
                    },
                },
            };
            const user = await prisma.member.create({
                data: memberData,
                select: {
                    id: true,
                    email: true,
                    full_name: true,
                    role: true,
                    created_at: true,
                },
            });
            return user;
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("Unique constraint")) {
                    throw new Error(error.message.replace(/\n/g, " "));
                }
            }
            throw error;
        }
    });
};
exports.createMember = createMember;
const createUser = async (userData) => {
    const hashedPassword = await (0, password_1.hashPassword)(userData.password);
    try {
        const user = await database_1.prisma.user.create({
            data: {
                email: userData.email,
                full_name: userData.full_name,
                password: hashedPassword,
                role: userData.role || prisma_1.Role.ADMIN,
                department: userData.department,
                status: client_1.UserStatus.ACTIVE,
            },
            select: {
                id: true,
                email: true,
                full_name: true,
                role: true,
                created_at: true,
            },
        });
        return user;
    }
    catch (error) {
        throw error;
    }
};
exports.createUser = createUser;
const updateUser = async (userId, userData) => {
    try {
        const user = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                email: userData.email,
                full_name: userData.full_name,
                ...(userData.password && { password: userData.password }),
                role: userData.role,
                department: userData.department,
                updated_at: new Date(),
            },
            select: {
                id: true,
                email: true,
                full_name: true,
                role: true,
                department: true,
                created_at: true,
                updated_at: true,
            },
        });
        return user;
    }
    catch (error) {
        throw error;
    }
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    const user = await database_1.prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new Error("Member not found");
    }
    return database_1.prisma.user.delete({
        where: { id },
        select: {
            id: true,
        },
    });
};
exports.deleteUser = deleteUser;
const updateMember = async (id, userData) => {
    const existingUser = await database_1.prisma.member.findUnique({
        where: { id },
        include: {
            next_of_kin: true,
        },
    });
    if (!existingUser) {
        throw new Error("User not found");
    }
    const user = await database_1.prisma.member.update({
        where: { id },
        data: {
            ...userData,
            ...(userData.next_of_kin &&
                existingUser.next_of_kin.length > 0 && {
                next_of_kin: {
                    update: {
                        where: { id: existingUser.next_of_kin[0].id },
                        data: userData.next_of_kin,
                    },
                },
            }),
        },
        select: {
            id: true,
            email: true,
            full_name: true,
            created_at: true,
            next_of_kin: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    relationship: true,
                    gender: true,
                    phone: true,
                    email: true,
                    address: true,
                },
            },
        },
    });
    return user;
};
exports.updateMember = updateMember;
const deleteMember = async (id) => {
    const member = await database_1.prisma.member.findUnique({
        where: { id },
    });
    if (!member) {
        throw new Error("Member not found");
    }
    return database_1.prisma.user.delete({
        where: { id },
        select: {
            id: true,
        },
    });
};
exports.deleteMember = deleteMember;
const findMemberByUsername = async (username) => {
    if (!username) {
        throw new Error("Username is required");
    }
    const member = await database_1.prisma.member.findUnique({
        where: {
            username: username,
        },
        select: {
            id: true,
            full_name: true,
            password: true,
            email: true,
            role: true,
            status: true,
            monthlyDeduction: true,
            bank: {
                select: {
                    bank_name: true,
                    account_number: true,
                },
            },
        },
    });
    return member;
};
exports.findMemberByUsername = findMemberByUsername;
const findUserByEmail = async (email) => {
    const user = await database_1.prisma.user.findUnique({
        where: { email: email },
        select: {
            id: true,
            full_name: true,
            email: true,
            password: true,
            role: true,
            status: true,
        },
    });
    if (!user)
        throw new Error("User does not exist");
    return user;
};
exports.findUserByEmail = findUserByEmail;
const findMemberById = async (id) => {
    const member = await database_1.prisma.member.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            full_name: true,
            created_at: true,
            username: true,
            bank: true,
            address: true,
            phone: true,
            savings: true,
            next_of_kin: true,
            date_of_birth: true,
            occupation: true,
            gender: true,
            state_of_origin: true,
            status: true,
            monthlyDeduction: true,
            marital_status: true,
            place_of_work: true
        },
    });
    if (!member)
        throw new Error("Member does not exist");
    return member;
};
exports.findMemberById = findMemberById;
const getAllMembers = async (params = {}) => {
    const { page = 1, limit = 10, search = "", sortBy = "created_at", sortOrder = "desc", role, status, createdAfter, createdBefore, } = params;
    const offset = (page - 1) * limit;
    const whereClause = {};
    if (search) {
        whereClause.OR = [
            {
                email: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                first_name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                last_name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                service_number: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }
    if (role) {
        whereClause.role = role;
    }
    if (status) {
        whereClause.status = status;
    }
    if (createdAfter || createdBefore) {
        whereClause.created_at = {};
        if (createdAfter) {
            whereClause.created_at.gte = createdAfter;
        }
        if (createdBefore) {
            whereClause.created_at.lte = createdBefore;
        }
    }
    const totalMembers = await database_1.prisma.member.count({
        where: whereClause,
    });
    const users = await database_1.prisma.member.findMany({
        where: whereClause,
        orderBy: {
            [sortBy]: sortOrder,
        },
        skip: offset,
        take: limit,
        select: {
            id: true,
            email: true,
            full_name: true,
            phone: true,
            username: true,
            status: true,
            role: true,
            created_at: true,
            updated_at: true,
            address: true,
            bank: {
                select: {
                    account_number: true,
                    bank_name: true,
                },
            },
            password: false,
            pin: false,
        },
    });
    const totalPages = Math.ceil(totalMembers / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    return {
        users,
        pagination: {
            currentPage: page,
            totalPages,
            totalMembers,
            hasNextPage,
            hasPreviousPage,
        },
    };
};
exports.getAllMembers = getAllMembers;
const approveMember = async (data) => {
    const member = await database_1.prisma.member.findUnique({
        where: { id: data.memberId },
    });
    if (!member) {
        throw new Error("Member not found");
    }
    if (member.status === prisma_1.MemberStatus.ACTIVE) {
        throw new Error("Member approved already");
    }
    const updateData = {
        status: prisma_1.MemberStatus.ACTIVE,
        updated_at: new Date(),
    };
    const updatedMember = await database_1.prisma.member.update({
        where: { id: data.memberId },
        data: updateData,
    });
    return updatedMember;
};
exports.approveMember = approveMember;
const rejectMember = async (data) => {
    const member = await database_1.prisma.member.findUnique({
        where: { id: data.memberId },
    });
    if (!member) {
        throw new Error("Member not found");
    }
    if (member.status === prisma_1.MemberStatus.REJECTED) {
        throw new Error("Member rejected already");
    }
    const updateData = {
        status: prisma_1.MemberStatus.REJECTED,
        updated_at: new Date(),
    };
    const updatedMember = await database_1.prisma.member.update({
        where: { id: data.memberId },
        data: updateData,
    });
    return updatedMember;
};
exports.rejectMember = rejectMember;
const changePin = async (pin, memberId) => {
    const member = await database_1.prisma.member.findUnique({
        where: { id: memberId },
        select: {
            id: true,
            pin: true,
        },
    });
    if (!member) {
        throw new Error("Member not found");
    }
    const updatedMember = await database_1.prisma.member.update({
        where: { id: memberId },
        data: {
            pin: pin,
        },
        select: {
            id: true,
        },
    });
    return {
        data: updatedMember,
        message: "Transaction Pin Changed Successfully",
    };
};
exports.changePin = changePin;
const getAllUsers = async (params = {}) => {
    const { page = 1, limit = 10, search = "", sortBy = "created_at", sortOrder = "desc", role, status, createdAfter, createdBefore, } = params;
    const offset = (page - 1) * limit;
    const whereClause = {};
    if (search) {
        whereClause.OR = [
            {
                email: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                first_name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                last_name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }
    if (role) {
        whereClause.role = role;
    }
    if (status) {
        whereClause.status = status;
    }
    if (createdAfter || createdBefore) {
        whereClause.created_at = {};
        if (createdAfter) {
            whereClause.created_at.gte = createdAfter;
        }
        if (createdBefore) {
            whereClause.created_at.lte = createdBefore;
        }
    }
    const totalUsers = await database_1.prisma.user.count({
        where: whereClause,
    });
    const users = await database_1.prisma.user.findMany({
        where: whereClause,
        orderBy: {
            [sortBy]: sortOrder,
        },
        skip: offset,
        take: limit,
        select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
            created_at: true,
            updated_at: true,
            status: true,
        },
    });
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    return {
        users,
        pagination: {
            currentPage: page,
            totalPages,
            totalUsers,
            hasNextPage,
            hasPreviousPage,
        },
    };
};
exports.getAllUsers = getAllUsers;
//# sourceMappingURL=userService.js.map