import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";


const authRoutes = (User, config) => {

    const router = express.Router();

    /* REGISTER */
    router.post("/register", async (req, res) => {

        try {

            const { email, password, ...extraData } = req.body;

            if (!email || !password)
                return res.status(400).json({ msg: "Missing fields" });

            const exist = await User.findOne({ email });

            if (exist)
                return res.status(400).json({ msg: "User already exists" });

            const hash = await bcrypt.hash(password, 10);

            /* Create verify token */
            const verifyToken = crypto.randomBytes(32).toString("hex");

            const user = await User.create({
                email,
                password: hash,
                isVerified: false,
                verifyToken,
                ...extraData
            });

            /* DEV MODE EMAIL */
            const verifyLink = `${config.appUrl}/auth/verify?token=${verifyToken}`;

            console.log("\n📧 DEV MAIL");
            console.log("================================");
            console.log("Verify link:");
            console.log(verifyLink);
            console.log("================================\n");

            res.json({
                msg: "Registered. Check email to verify account."
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                msg: "Registration failed"
            });
        }
    });

    /* VERIFY EMAIL */
    router.get("/verify", async (req, res) => {

        try {

            const { token } = req.query;

            if (!token)
                return res.status(400).send("Invalid link");

            const user = await User.findOne({ verifyToken: token });

            if (!user)
                return res.status(400).send("Invalid or expired link");

            user.isVerified = true;
            user.verifyToken = null;

            await user.save();

            res.send("Email verified successfully. You can now login.");

        } catch {
            res.status(500).send("Verification failed");
        }
    });


    /* LOGIN */
    router.post("/login", async (req, res) => {
        try {

            const { email, password } = req.body;

            if (!email || !password)
                return res.status(400).json({ msg: "Missing email or password!" });

            const user = await User.findOne({ email });

            if (!user)
                return res.status(400).json({ msg: "Invalid credentials" });

            if (!user.isVerified) {
                return res.status(403).json({
                    msg: "Please verify your email before login."
                });
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match)
                return res.status(400).json({ msg: "Invalid credentials" });

            /* Generate Access Token (15 min) */
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

            /* Generate Refresh Token (Random) */
            const refreshToken = crypto.randomBytes(64).toString("hex");

            /* Save Refresh Token in DB */
            user.refreshToken = refreshToken;
            await user.save();

            /* Set Access Cookie */
            res.cookie("access_token", accessToken, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            });

            /* Set Refresh Cookie */
            res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({ msg: "Logged in successfully" });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                msg: "Login failed",
                error: err.message
            });
        }
    });


    /* REFRESH TOKEN */
    router.post("/refresh", async (req, res) => {
        try {

            const refreshToken = req.cookies?.refresh_token;

            if (!refreshToken) {
                return res.status(401).json({
                    msg: "Refresh token missing"
                });
            }

            /* Find user by refresh token */
            const user = await User.findOne({ refreshToken });

            if (!user) {
                return res.status(401).json({
                    msg: "Invalid refresh token"
                });
            }

            /* Create New Access Token */
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

            /* Send New Cookie */
            res.cookie("access_token", newAccessToken, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            });

            res.json({ msg: "Token refreshed" });

        } catch (err) {

            console.error(err);

            res.status(401).json({
                msg: "Refresh failed"
            });
        }
    });


    /* FORGOT PASSWORD */
    router.post("/forgot-password", async (req, res) => {

        try {

            const { email } = req.body;

            if (!email)
                return res.status(400).json({ msg: "Email required" });

            const user = await User.findOne({ email });

            if (!user) {
                // Don't reveal if email exists
                return res.json({
                    msg: "If account exists, reset link sent"
                });
            }

            const resetToken = crypto.randomBytes(32).toString("hex");

            user.resetToken = resetToken;
            user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min

            await user.save();

            const resetLink =
                `${config.appUrl}/auth/reset-password?token=${resetToken}`;

            console.log("\n📧 DEV RESET MAIL");
            console.log("================================");
            console.log(resetLink);
            console.log("================================\n");

            res.json({
                msg: "If account exists, reset link sent"
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                msg: "Reset request failed"
            });
        }
    });


    /* RESET PASSWORD */
    router.post("/reset-password", async (req, res) => {

        try {

            const { token, newPassword } = req.body;

            if (!token || !newPassword)
                return res.status(400).json({ msg: "Missing fields" });

            const user = await User.findOne({
                resetToken: token,
                resetTokenExpiry: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    msg: "Invalid or expired token"
                });
            }

            const hash = await bcrypt.hash(newPassword, 10);

            user.password = hash;

            /* Kill all sessions */
            user.refreshToken = null;

            user.resetToken = null;
            user.resetTokenExpiry = null;

            await user.save();

            res.json({
                msg: "Password reset successful. Please login again."
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                msg: "Reset failed"
            });
        }
    });


    /* LOGOUT */
    router.post("/logout", async (req, res) => {

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

            res.json({ msg: "Logged out successfully" });

        } catch (err) {

            res.status(500).json({
                msg: "Logout failed"
            });
        }
    });


    return router;
};

export default authRoutes;
