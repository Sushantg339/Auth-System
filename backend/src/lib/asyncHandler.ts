import type { NextFunction, Request, Response, RequestHandler } from "express";

const asyncHandler = (handler: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

export default asyncHandler;