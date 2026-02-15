import express from "express";
import cookieParser from "cookie-parser";
import auth from "./src/index.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

await auth.init({
    dbURI: "mongodb://127.0.0.1:27017/proauth-test",
    jwtSecret: "dev-secret",
    appUrl: "http://localhost:4000",

    customSchema: {
        name: {
            type: String,
            required: true
        },

        age: {
            type: Number
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"]
        }
    }
});


/* Mount auth routes */
app.use("/auth", auth.routes());

/* Protected route */
app.get("/profile", auth.protect(), (req, res) => {
    res.json({ user: req.user });
});

app.listen(4000, () => {
    console.log("Dev server running on 4000");
});
