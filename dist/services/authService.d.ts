import { LoginData, UserLoginData } from "../types";
export declare const authenticateMember: (loginData: LoginData) => Promise<{
    token: string;
    user: {
        id: string;
        email: string;
        full_name: string;
        role: import(".prisma/client").$Enums.Role;
    };
}>;
export declare const authenticateUser: (loginData: UserLoginData) => Promise<{
    token: string;
    user: {
        id: string;
        email: string;
        full_name: string;
        role: import(".prisma/client").$Enums.Role;
    };
}>;
export declare const changePassword: (data: {
    memberId: string;
    oldPassword: string;
    newPassword: string;
}) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const sendPasswordResetOtp: (email: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const verifyResetOtp: (email: string, otp: string) => Promise<{
    success: boolean;
    isMember: boolean;
    message: string;
}>;
export declare const updatePassword: (email: string, newPassword: string, isMember: boolean) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const cleanupExpiredOtps: () => Promise<void>;
//# sourceMappingURL=authService.d.ts.map