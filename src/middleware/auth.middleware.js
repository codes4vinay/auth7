import jwt from "jsonwebtoken";

export const protect = (config) => {

    return (req, res, next) => {

        try {

            const token = req.cookies?.access_token;

            if (!token)
                return res.status(401).json({ msg: "Login required" });

            const decoded = jwt.verify(token, config.jwtSecret, {
                issuer: "auth7-kit"
            });

            req.user = {
                id: decoded.sub,
                role: decoded.role
            };

            next();

        } catch {
            return res.status(401).json({ msg: "Invalid or expired session" });
        }
    };
};
