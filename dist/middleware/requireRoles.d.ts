import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { Role } from "../generated/prisma";
export declare const requireRoles: (allowedRoles: Role[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=requireRoles.d.ts.map