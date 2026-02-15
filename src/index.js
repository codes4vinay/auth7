import { connectDB } from "./db/connect.js";
import { createUserModel } from "./models/createUserModel.js";
import authRoutes from "./routes/auth.routes.js";
import { protect } from "./middleware/auth.middleware.js";

let User = null;
let config = null;

/* INIT */
export const init = async (options = {}) => {

    if (!options.dbURI) {
        throw new Error("MongoDB URI missing");
    }

    if (!options.jwtSecret) {
        throw new Error("JWT secret missing");
    }

    config = {
        dbURI: options.dbURI,
        jwtSecret: options.jwtSecret,
        accessTokenExpiry: options.accessTokenExpiry || "15m",
        appUrl: options.appUrl
    };

    await connectDB(config.dbURI);

    User = createUserModel(options.customSchema || {});
};

/* ROUTES */
export const routes = () => {
    if (!User || !config) {
        throw new Error("Call init() first");
    }

    return authRoutes(User, config);
};

/* MIDDLEWARE */
export const protectRoute = () => {
    if (!config) {
        throw new Error("Call init() first");
    }

    return protect(config);
};

export default {
    init,
    routes,
    protect: protectRoute
};
