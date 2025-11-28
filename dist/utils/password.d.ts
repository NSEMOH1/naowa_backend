export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePasswords: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const hashPin: (pin: string) => Promise<string>;
export declare const hashAnswer: (answer: string) => Promise<string>;
export declare const comparePin: (inputPin: string | number, hashedPin: string) => Promise<boolean>;
export declare const generateRandomPassword: () => string;
//# sourceMappingURL=password.d.ts.map