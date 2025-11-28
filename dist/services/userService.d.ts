import { CreateMemberData, CreateUserData, GetAllMembersParams, GetAllUsersParams, PaginatedMembersResponse, PaginatedUsersResponse, UpdateUserData } from "../types";
import { Prisma } from "@prisma/client";
export declare const createMember: (userData: CreateMemberData) => Promise<{
    id: string;
    email: string;
    created_at: Date;
    full_name: string;
    role: import(".prisma/client").$Enums.Role;
}>;
export declare const createUser: (userData: CreateUserData) => Promise<{
    id: string;
    email: string;
    created_at: Date;
    full_name: string;
    role: import(".prisma/client").$Enums.Role;
}>;
export declare const updateUser: (userId: string, userData: UpdateUserData) => Promise<{
    id: string;
    email: string;
    created_at: Date;
    full_name: string;
    role: import(".prisma/client").$Enums.Role;
    updated_at: Date;
    department: import(".prisma/client").$Enums.Department;
}>;
export declare const deleteUser: (id: string) => Promise<{
    id: string;
}>;
export declare const updateMember: (id: string, userData: Prisma.MemberUpdateInput) => Promise<{
    id: string;
    email: string;
    created_at: Date;
    full_name: string;
    next_of_kin: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        gender: import(".prisma/client").$Enums.Gender;
        phone: string;
        address: string | null;
        relationship: import(".prisma/client").$Enums.Relationship;
    }[];
}>;
export declare const deleteMember: (id: string) => Promise<{
    id: string;
}>;
export declare const findMemberByUsername: (username: string) => Promise<{
    id: string;
    email: string;
    password: string;
    full_name: string;
    role: import(".prisma/client").$Enums.Role;
    monthlyDeduction: string;
    status: import(".prisma/client").$Enums.MemberStatus;
    bank: {
        bank_name: string;
        account_number: string;
    }[];
} | null>;
export declare const findUserByEmail: (email: string) => Promise<{
    id: string;
    email: string;
    password: string;
    full_name: string;
    role: import(".prisma/client").$Enums.Role;
    status: import(".prisma/client").$Enums.UserStatus;
}>;
export declare const findMemberById: (id: string) => Promise<{
    id: string;
    email: string;
    created_at: Date;
    username: string;
    full_name: string;
    gender: import(".prisma/client").$Enums.Gender;
    phone: string;
    address: string;
    state_of_origin: string;
    marital_status: string;
    occupation: string;
    date_of_birth: Date;
    place_of_work: string | null;
    monthlyDeduction: string;
    status: import(".prisma/client").$Enums.MemberStatus;
    bank: {
        id: string;
        bank_name: string;
        account_name: string;
        account_number: string;
        memberId: string;
    }[];
    savings: {
        id: string;
        status: import(".prisma/client").$Enums.SavingStatus;
        memberId: string;
        amount: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        reference: string;
    }[];
    next_of_kin: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        gender: import(".prisma/client").$Enums.Gender;
        phone: string;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        relationship: import(".prisma/client").$Enums.Relationship;
    }[];
}>;
export declare const getAllMembers: (params?: GetAllMembersParams) => Promise<PaginatedMembersResponse>;
export declare const approveMember: (data: {
    memberId: string;
}) => Promise<{
    id: string;
    email: string;
    created_at: Date;
    username: string;
    password: string;
    full_name: string;
    gender: import(".prisma/client").$Enums.Gender;
    phone: string;
    address: string;
    state_of_origin: string;
    spouse_name: string | null;
    marital_status: string;
    occupation: string;
    role: import(".prisma/client").$Enums.Role;
    date_of_birth: Date;
    updated_at: Date;
    profile_picture: string;
    nin_document: string;
    place_of_work: string | null;
    monthlyDeduction: string;
    pin: string;
    status: import(".prisma/client").$Enums.MemberStatus;
}>;
export declare const rejectMember: (data: {
    memberId: string;
}) => Promise<{
    id: string;
    email: string;
    created_at: Date;
    username: string;
    password: string;
    full_name: string;
    gender: import(".prisma/client").$Enums.Gender;
    phone: string;
    address: string;
    state_of_origin: string;
    spouse_name: string | null;
    marital_status: string;
    occupation: string;
    role: import(".prisma/client").$Enums.Role;
    date_of_birth: Date;
    updated_at: Date;
    profile_picture: string;
    nin_document: string;
    place_of_work: string | null;
    monthlyDeduction: string;
    pin: string;
    status: import(".prisma/client").$Enums.MemberStatus;
}>;
export declare const changePin: (pin: string, memberId: string) => Promise<{
    data: {
        id: string;
    };
    message: string;
}>;
export declare const getAllUsers: (params?: GetAllUsersParams) => Promise<PaginatedUsersResponse>;
//# sourceMappingURL=userService.d.ts.map