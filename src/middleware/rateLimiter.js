const rateLimit = require("express-rate-limit");

// Login: prevent brute-forcing passwords. 10 attempts per 15 min per IP is
// generous enough for a real user who mistypes, but stops scripted attacks.
exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Register: stop bot/script signup spam.
exports.registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { success: false, message: "Too many accounts created from this IP. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Forgot-password: this is the most important one to throttle — without it,
// someone could spam the endpoint trying different emails, or hammer a single
// email trying to force multiple valid reset tokens to exist at once.
exports.forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many password reset requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});