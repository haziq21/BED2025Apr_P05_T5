/** @import { Request, Response, NextFunction } from "express" */
/** @typedef {Request & { userId?: number }} AuthenticatedRequest */
/** @typedef {(req: AuthenticatedRequest, res: Response, next?: NextFunction) => Promise<void>} AuthenticatedRequestHandler */

export {}; // Required to make this file a module
