import mongoose from 'mongoose';

export const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log("MongoDB Connected!")
    } catch (err) {
        console.error("Database connection Error:", err.message);
        process.exit(1);
    }
}
