import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";

import { registerSchema, loginSchema } from "../validation/authValidation.js";

import { loginLimiter, registerLimiter, passwordResetLimiter } from "../middleware/rateLimit.js";

import { createTransporter } from "../utils/mailer.js";
import { success, error } from "../utils/response.js";

const authRoutes = (User, config) => {

    const router = express.Router();
    const mailer = createTransporter(config.smtp);


    /* REGISTER */
    router.post("/register", registerLimiter, validate(registerSchema), async (req, res) => {
        try {
            const { name, email, password, ...extraData } = req.body;
            const exist = await User.findOne({ email });
            if (exist) {
                return error(res, "User already exists", 400);
            }

            const hash = await bcrypt.hash(password, 10);
            const verifyToken = crypto.randomBytes(32).toString("hex");

            await User.create({
                name,
                email,
                password: hash,
                isVerified: false,
                verifyToken,
                ...extraData
            });

            const verifyLink =
                `${config.appUrl}/auth/verify?token=${verifyToken}`;

            await mailer.sendMail({
                to: email,
                subject: "Verify your email",
                html: `
                        <h2>Email Verification</h2>
                        <p>Click the link below to verify your account:</p>
                        <a href="${verifyLink}">${verifyLink}</a>
                    `
            });

            success(res, "Registration successful. Check email to verify.");

        } catch (err) {

            console.error(err);

            error(res, "Registration failed", 500);
        }
    }
    );

    /* VERIFY EMAIL */
    router.get("/verify", async (req, res) => {

        try {

            const { token } = req.query;

            if (!token) {
                return error(res, "Invalid verification link", 400);
            }

            const user = await User.findOne({ verifyToken: token });

            if (!user) {
                return error(res, "Invalid or expired token", 400);
            }

            user.isVerified = true;
            user.verifyToken = null;

            await user.save();

            res.send("Auth7 :: Email verified successfully. You can now login.");

        } catch {

            res.status(500).send("Auth7 :: Verification failed");
        }
    });

    /* LOGIN */
    router.post("/login", loginLimiter, validate(loginSchema), async (req, res) => {
        try {

            const { email, password } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                return error(res, "Invalid credentials", 400);
            }

            if (!user.isVerified) {
                return error(res, "Please verify your email first", 403);
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return error(res, "Invalid credentials", 400);
            }

            const accessToken = jwt.sign(
                {
                    sub: user._id.toString(),
                    role: user.role
                },
                config.jwtSecret,
                {
                    expiresIn: config.accessTokenExpiry || "15m",
                    issuer: "auth7-kit"
                }
            );

            const refreshToken =
                crypto.randomBytes(64).toString("hex");

            user.refreshToken = refreshToken;
            await user.save();

            res.cookie("access_token", accessToken, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            });

            res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            success(res, "Login successful");

        } catch (err) {

            console.error(err);

            error(res, "Login failed", 500);
        }
    }
    );

    /* REFRESH TOKEN */
    router.post("/refresh", async (req, res) => {

        try {

            const refreshToken = req.cookies?.refresh_token;

            if (!refreshToken) {
                return error(res, "Refresh token missing", 401);
            }

            const user = await User.findOne({ refreshToken });

            if (!user) {
                return error(res, "Invalid refresh token", 401);
            }

            const newAccessToken = jwt.sign(
                {
                    sub: user._id.toString(),
                    role: user.role
                },
                config.jwtSecret,
                {
                    expiresIn: config.accessTokenExpiry || "15m",
                    issuer: "auth7-kit"
                }
            );

            res.cookie("access_token", newAccessToken, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            });

            success(res, "Token refreshed");

        } catch (err) {

            console.error(err);

            error(res, "Refresh failed", 401);
        }
    });

    /* CURRENT USER */
    router.get("/me", protect(config), async (req, res) => {

        const user = await User.findById(req.user.id)
            .select("-password");

        success(res, "User fetched", { user });
    });

    /* UPDATE PROFILE */
    router.patch("/update", protect(config), async (req, res) => {

        try {

            const updates = { ...req.body };

            delete updates.password;
            delete updates.email;
            delete updates._id;
            delete updates.__v;
            delete updates.refreshToken;

            if (Object.keys(updates).length === 0) {
                return error(res, "No fields provided", 400);
            }

            const user = await User.findByIdAndUpdate(
                req.user.id,
                updates,
                { new: true, runValidators: true }
            ).select("-password");

            success(res, "Profile updated", { user });

        } catch (err) {

            console.error(err);

            error(res, "Update failed", 500);
        }
    });

    /* FORGOT PASSWORD */
    router.post(
        "/forgot-password",
        passwordResetLimiter,
        async (req, res) => {

            try {

                const { email } = req.body;

                const user = await User.findOne({ email });

                if (!user) {
                    return success(res, "If account exists, reset link sent");
                }

                const resetToken =
                    crypto.randomBytes(32).toString("hex");

                user.resetToken = resetToken;
                user.resetTokenExpiry =
                    Date.now() + 10 * 60 * 1000;

                await user.save();

                const resetLink =
                    `${config.appUrl}/auth/reset-password?token=${resetToken}`;

                await mailer.sendMail({
                    to: email,
                    subject: "Password Reset",
                    html: `
                        <h2>Password Reset</h2>
                        <p>Click the link below to reset your password:</p>
                        <a href="${resetLink}">${resetLink}</a>
                    `
                });

                success(res, "If account exists, reset link sent");

            } catch (err) {

                console.error(err);

                error(res, "Reset request failed", 500);
            }
        }
    );

    /* RESET PASSWORD */
    router.post(
        "/reset-password",
        passwordResetLimiter,
        async (req, res) => {

            try {

                const { token, newPassword } = req.body;

                const user = await User.findOne({
                    resetToken: token,
                    resetTokenExpiry: { $gt: Date.now() }
                });

                if (!user) {
                    return error(res, "Invalid or expired token", 400);
                }

                const hash = await bcrypt.hash(newPassword, 10);

                user.password = hash;
                user.refreshToken = null;
                user.resetToken = null;
                user.resetTokenExpiry = null;

                await user.save();

                success(res, "Password reset successful. Please login again.");

            } catch (err) {

                console.error(err);

                error(res, "Reset failed", 500);
            }
        }
    );

    /* CHANGE PASSWORD */
    router.post("/change-password", protect(config), async (req, res) => {

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);

        const match = await bcrypt.compare(currentPassword, user.password);

        if (!match) {
            return error(res, "Current password incorrect");
        }

        const hash = await bcrypt.hash(newPassword, 10);

        user.password = hash;

        /* Kill sessions */
        user.refreshToken = null;

        await user.save();

        success(res, "Password changed successfully");
    });

    /* LOGOUT */
    router.post("/logout", protect(config), async (req, res) => {

        try {

            const refreshToken = req.cookies?.refresh_token;

            if (refreshToken) {
                await User.updateOne(
                    { refreshToken },
                    { $unset: { refreshToken: "" } }
                );
            }

            res.clearCookie("access_token");
            res.clearCookie("refresh_token");

            success(res, "Logged out successfully");

        } catch {

            error(res, "Logout failed", 500);
        }
    });

    /* SESSION */
    router.get("/session", async (req, res) => {

        const token = req.cookies?.access_token;

        if (!token) {
            return success(res, "No active session", { authenticated: false });
        }

        try {

            const decoded = jwt.verify(token, config.jwtSecret);

            success(res, "Session active", {
                authenticated: true,
                user: {
                    id: decoded.sub,
                    role: decoded.role
                }
            });

        } catch {

            success(res, "Session expired", { authenticated: false });
        }
    });

    return router;
};

export default authRoutes;