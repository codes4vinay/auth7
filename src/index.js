import { connectDB } from "./db/connect.js";
import { createUserModel } from "./models/createUserModel.js";
import authRoutes from "./routes/auth.routes.js";
import { protect } from "./middleware/auth.middleware.js";

let User = null;
let config = null;
let initialized = false;

/* INIT */
export const init = async (options = {}) => {

    if (initialized) {
        throw new Error("Auth7 already initialized");
    }

    if (!options.dbURI) {
        throw new Error("Auth7: MongoDB URI missing");
    }

    if (!options.jwtSecret) {
        throw new Error("Auth7: JWT secret missing");
    }

    config = Object.freeze({
        dbURI: options.dbURI,
        jwtSecret: options.jwtSecret,
        accessTokenExpiry: options.accessTokenExpiry || "15m",
        appUrl: options.appUrl || "http://localhost:3000"
    });

    await connectDB(config.dbURI);

    User = createUserModel(options.customSchema || {});

    initialized = true;
};

/* ROUTES */
export const routes = () => {

    if (!initialized) {
        throw new Error("Auth7: Call init() before using routes()");
    }

    return authRoutes(User, config);
};

/* PROTECT MIDDLEWARE */
export const protectRoute = () => {

    if (!initialized) {
        throw new Error("Auth7: Call init() before using protect()");
    }

    return protect(config);
};

export default {
    init,
    routes,
    protect: protectRoute
};