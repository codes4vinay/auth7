import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(128, { message: "Password cannot exceed 128 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" })
}).catchall(z.any());  //catchall() allows extra fields

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string()
}).strict();   //strict() blocks extra fields