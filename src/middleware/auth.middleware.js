import jwt from "jsonwebtoken";

export const protect = (config, requiredRole = null) => {

    return (req, res, next) => {

        try {

            const token = req.cookies?.access_token;

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: "Auth7 :: Login required"
                });
            }

            const decoded = jwt.verify(token, config.jwtSecret);

            req.user = {
                id: decoded.sub,
                role: decoded.role
            };

            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({
                    success: false,
                    message: "Auth7 :: Access denied"
                });
            }

            next();

        } catch {

            return res.status(401).json({
                success: false,
                message: "Auth7 :: Invalid session"
            });
        }
    };
};