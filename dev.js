import express from "express";
import cookieParser from "cookie-parser";
import auth from "./src/index.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

await auth.init({
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
