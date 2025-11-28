export declare const generateFinancialReport: (startDate: Date, endDate: Date, includeMemberDetails?: boolean) => Promise<{}>;
export declare const generateLoanRepaymentReport: (startDate: Date, endDate: Date, includeMemberDetails?: boolean) => Promise<{}>;
export declare const generateMemberFinancialSummary: (memberId: string, startDate?: Date, endDate?: Date) => Promise<{}>;
export declare const getAllMembersFinancialSummary: (startDate?: Date, endDate?: Date) => Promise<{}>;
export declare const generateTrialBalanceReport: (asOfDate: Date) => Promise<{
    asOfDate: Date;
    accounts: {
        name: string;
        debit: number;
        credit: number;
    }[];
    totals: {
        debit: number;
        credit: number;
    };
}>;
export declare const generateProfitLossReport: (startDate: Date, endDate: Date) => Promise<{
    period: {
        start: Date;
        end: Date;
    };
    revenue: {
        loanInterest: number;
        fees: number;
        otherIncome: number;
        total: number;
    };
    expenses: {
        salaries: number;
        operational: number;
        loanLossProvision: number;
        total: number;
    };
    netProfit: number;
}>;
export declare const generateBalanceSheetReport: (asOfDate: Date) => Promise<{
    asOfDate: Date;
    assets: {
        current: {
            cash: number;
            receivables: number;
            loansOutstanding: number;
            total: number;
        };
        fixed: number;
        total: number;
    };
    liabilities: {
        current: number;
        longTerm: number;
        total: number;
    };
    equity: number;
}>;
//# sourceMappingURL=reportService.d.ts.map