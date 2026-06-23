import type { RequestHandler } from "express";

import client from "../config/redis.config.js";

export const csrfMiddleware: RequestHandler = async (req, res, next) => {
    try {
        if (req.method == "GET") {
            return next();
        }

        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                data: null,
            });
        }

        const clientToken =
        req.headers["x-csrf-token"] ||
        req.headers["x-xsrf-token"] ||
        req.headers["csrf-token"];

        if (!clientToken) {
            return res.status(403).json({
                success: false,
                message: "CSRF token missing. Please refresh the page",
                code: "CSRF_TOKEN_MISSING",
                data: null,
            });
        }

        const csrfKey = `csrf:${userId}`;

        const storedCsrfToken = await client.get(csrfKey);

        if (!storedCsrfToken) {
            return res.status(403).json({
                success: false,
                message: "CSRF token expired. Please try again",
                code: "CSRF_TOKEN_EXPIRED",
                data: null,
            });
        }

        if (storedCsrfToken !== clientToken) {
            return res.status(403).json({
                success: false,
                message: "Invalid CSRF token. Please Please refresh the page",
                code: "CSRF_TOKEN_INVALID",
                data: null,
            });
        }

        next();
    } catch (error) {
        console.log("CSRF verification error: ", error)
        return res.status(500).json({
            success: false,
            message : "Csrf verification failed",
            code: "CSRF_VERIFICATION_ERROR",
            data: null
        })
    }
};