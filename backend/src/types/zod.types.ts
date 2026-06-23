import {z} from "zod"

export const signupSchema = z.object({
    name: z.string().trim().min(2, "Name must be atleast 2 characters long"),
    email: z.email("Invalid email format"),
    password: z.string().trim().min(6, "Password must be atleast 6 characters long")
})

export const loginSchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().trim().min(6, "Password must be atleast 6 characters long")
})

export const verifyOtpSchema = z.object({
    email: z.email("Invalid email format"),
    otp: z.string().length(6, "Otp must be of 6 characters")
})