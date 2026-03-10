import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // max requests
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers

    message: {
        error: "Too many login attempts. Try again later."
    }
});

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,

    message: {
        error: "Too many requests. Try again later."
    }
});

export const passwordResetLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 10,

    message: {
        error: "Too many requests. Try again later."
    }
});