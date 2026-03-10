import mongoose from "mongoose";
let UserModel = null;

export const createUserModel = (customFields = {}) => {

    if (UserModel) return UserModel;

    /* baseSchema */
    const baseSchema = {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        verifyToken: String,

        refreshToken: String,
        
        resetToken: String,

        resetTokenExpiry: Date,

    };

    /* Custom Schema */
    const finalSchema = {
        ...baseSchema,
        ...customFields
    };

    const schema = new mongoose.Schema(finalSchema, {
        timestamps: true
    });

    UserModel = mongoose.model("User", schema);

    return UserModel;
};

