import { LoanName, LoanStatus, TransactionType } from "@prisma/client";
import { Department, Gender, MemberStatus, Rank, Relationship, Role, UserStatus } from "../generated/prisma";
import { Request } from "express";
import Decimal from "decimal.js";
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: Role;
        full_name?: string;
    };
}
export interface CreateMemberData {
    email: string;
    role: Role;
    full_name: string;
    password: string;
    gender: Gender;
    phone: string;
    address: string;
    username: string;
    state_of_origin: string;
    pin: string;
    date_of_birth: Date;
    profile_picture: string;
    nin_document: string;
    monthly_deduction: string;
    marital_status: string;
    occupation: string;
    place_of_work: string;
    spouse_name?: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    security_question: string;
    security_answer: string;
    kin_first_name: string;
    kin_last_name: string;
    relationship: Relationship;
    kin_email: string;
    kin_phone: string;
    kin_gender: Gender;
    kin_address: string;
}
export interface LoginData {
    username: string;
    password: string;
}
export interface UserLoginData {
    email: string;
    password: string;
}
export interface CreateUserData {
    email: string;
    full_name: string;
    password: string;
    role: Role;
    department: Department;
}
export interface UpdateUserData {
    email?: string;
    full_name?: string;
    password?: string;
    role?: Role;
    rank?: Rank;
    department?: Department;
}
export interface UserResponse {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    other_name: string;
    gender: Gender;
    phone: string;
    address: string;
    state_of_origin: string;
    service_number: string;
    role: Role;
    rank: Rank;
    created_at: Date;
    updated_at: Date;
}
export interface AuthResponse {
    token: string;
    user: UserResponse;
}
export interface JwtPayload {
    id: string;
    email: string;
    [key: string]: any;
}
export interface GetAllMembersParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "created_at" | "email" | "first_name" | "last_name";
    sortOrder?: "asc" | "desc";
    role?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    status?: MemberStatus;
}
export interface GetAllUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "created_at" | "email";
    sortOrder?: "asc" | "desc";
    role?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    status?: UserStatus;
}
export interface PaginatedMembersResponse {
    users: {
        id: string;
        email: string;
        full_name: string;
        created_at: Date;
    }[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalMembers: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
export interface PaginatedUsersResponse {
    users: {
        id: string;
        email: string;
        full_name: string;
        status: UserStatus;
        created_at: Date;
    }[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
export interface LoanBalance {
    loanId: string;
    category: LoanName;
    reference: string;
    originalAmount: number;
    approvedAmount: number;
    interestRate: number;
    durationMonths: number;
    totalPaid: number;
    outstandingBalance: number;
    status: LoanStatus;
    startDate?: string;
    endDate?: string;
    nextPayment?: {
        dueDate: string;
        amount: number;
    };
    repaymentProgress: {
        paid: number;
        remaining: number;
        percentage: number;
    };
}
export interface MemberLoanHistory {
    id: string;
    reference: string;
    category: string;
    appliedAmount: number;
    approvedAmount: number;
    interestRate: number;
    durationMonths: number;
    status: LoanStatus;
    applicationDate: Date;
    approvalDate: Date | null;
    completionDate: Date | null;
    totalRepaid: number;
    outstandingBalance: number;
    nextPaymentDue?: {
        date: Date;
        amount: number;
    };
    repayments: {
        dueDate: Date;
        amount: number;
        status: string;
        paidDate: Date | null;
    }[];
    transactions: {
        id: string;
        type: TransactionType;
        amount: number;
        date: Date;
        status: string;
        description: string;
    }[];
}
export interface CooperativeSavingsRecord {
    email: string;
    username: string;
    amount: number;
    memberName?: string;
}
export interface createSavings {
    memberId: string;
    category_name: string;
    amount: Decimal;
}
export interface UploadResult {
    success: boolean;
    processedCount: number;
    errorCount: number;
    errors: Array<{
        row: number;
        username?: string;
        error: string;
    }>;
    summary: {
        totalAmount: number;
        validRecords: number;
        invalidRecords: number;
    };
}
export interface RequestData {
    reason: string;
    amount: string;
    memberId: string;
}
export interface ITermination {
    memberId: string;
    reason: string;
}
export interface LoanApplicationData {
    memberId: string;
    category: LoanName;
    amount: number;
    durationMonths: number;
    nonIndebtedness: string;
    validId: string;
    incomeProof: string;
    accountStatement: string;
    utilityBill: string;
    guarantorLetter: string;
    guarantorPassport: string;
    personalPassport: string;
    application: string;
    servicingLoan: string;
}
export interface PaymentIntentData {
    memberId: string;
    paymentType: string;
    amount: number;
    loanId?: string;
}
export interface PaymentMetadata {
    memberId: string;
    paymentType: string;
    loanId?: string;
}
export interface IWithdrawSavings {
    memberId: string;
    category_name: string;
    amount: Decimal;
    pin: string;
    reason?: string;
}
export interface IApproveWithdrawal {
    withdrawalId: string;
    approvedBy: string;
}
export interface IRejectWithdrawal {
    withdrawalId: string;
    rejectedBy: string;
    rejectionReason: string;
}
//# sourceMappingURL=index.d.ts.map