import type { RequestHandler } from "express";
import sanitize from "mongo-sanitize";
import bcrypt from "bcrypt"
import crypto from "node:crypto"

import asyncHandler from "../lib/asyncHandler.js";
import { parseBody } from "../lib/validation.js";
import { loginSchema, signupSchema, verifyOtpSchema } from "../types/zod.types.js";
import userModel from "../models/user.model.js";
import client from "../config/redis.config.js";
import { sendMail } from "../lib/sendMail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../assets/mail.html.js";
import generateToken, { generateAccessToken, revokeRefreshToken, verifyRefreshToken } from "../lib/generateToken.js";
import { generateCsrfToken } from "../lib/csrf.js";


export const signupController: RequestHandler = asyncHandler(async(req, res)=>{
    const parsed = parseBody(signupSchema, req.body)

    if(!parsed.success){
        const allErrors = parsed.error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message,
            code: issue.code,
        }));

        return res.status(400).json({
            success: false,
            message: allErrors,
            data: null
        })
    }

    const { name, email, password } = sanitize(parsed.data) as typeof parsed.data;

    const rateLimitKey = `signup-rate-limit:${req.ip}:${email}`

    const isKeyExist = await client.get(rateLimitKey)

    if(isKeyExist){
        return res.status(429).json({
            success: false,
            message : "Too many requests. Try again later",
            data: null
        })
    }

    const isExistingUser = await userModel.findOne({email})

    if(isExistingUser){
        return res.status(409).json({
            success: false,
            message: "User alreay exist",
            data: null
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const verifyToken = crypto.randomBytes(32).toString("hex")

    const verifyKey = `verify:${verifyToken}`

    const dataToStore = JSON.stringify({
        name, email, password: hashedPassword
    })

    await client.set(verifyKey, dataToStore, {EX: 300})

    const subject = "Verify your email to Signup."
    const html = getVerifyEmailHtml({email, token: verifyToken})

    const mailData = await sendMail({email, subject, html})

    await client.set(rateLimitKey, "true", {EX: 60})

    return res.status(200).json({
        success: true,
        message: "Verification link sent successfully",
        data: mailData
    })
})

export const verifyUserController: RequestHandler = asyncHandler(async(req , res)=>{
    const {token} = req.params

    if(!token){
        return res.status(400).json({
            success: false,
            message: "Verification Token is missing",
            data: null
        })
    }

    const verifyKey = `verify:${token}`

    const userDataJSON = await client.get(verifyKey)

    if(!userDataJSON){
        return res.status(400).json({
            success: false,
            message : "Verification link expired"
        })
    }

    const userData = JSON.parse(userDataJSON)

    await client.del(verifyKey)

    const isExistingUser = await userModel.findOne({email: userData.email})

    if(isExistingUser){
        return res.status(409).json({
            success: false,
            message: "User alreay exist",
            data: null
        })
    }

    const user = await userModel.create(userData)

    return res.status(201).json({
        success: true,
        message: "Email Verified Successfully, Account Created",
        data : {
            _id: user._id,
            name: user.name,
            email: user.email
        }
    })
})

export const loginController: RequestHandler = asyncHandler(async (req , res)=>{
    const parsed = parseBody(loginSchema, req.body)

    if(!parsed.success){
        const allErrors = parsed.error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message,
            code: issue.code,
        }));

        return res.status(400).json({
            success: false,
            message: allErrors,
            data: null
        })
    }

    const {email, password } = sanitize(parsed.data) as typeof parsed.data;

    const rateLimitKey = `login-rate-limit:${req.ip}:${email}`

    const isKeyExist = await client.get(rateLimitKey)

    if(isKeyExist){
        return res.status(429).json({
            success: false,
            message : "Too many requests. Try again later",
            data: null
        })
    }

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(400).json({
            success: false,
            message: "Invalid email or passsword",
            data: null
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
        return res.status(400).json({
            success: false,
            message: "Invalid email or passsword",
            data: null
        })
    }

    const otp = Math.floor(100000 + Math.random()* 900000).toString()

    const otpKey = `otp:${email}`

    await client.set(otpKey, JSON.stringify(otp), {EX: 300})

    const subject = "Verification OTP"
    const html = getOtpHtml({email, otp})

    const mailData = await sendMail({email, subject, html})

    await client.set(rateLimitKey, "true", {EX: 60})

    return res.status(200).json({
        success: true,
        message: "Verification otp sent successfully",
        data: mailData
    })
})

export const verifyOtpController: RequestHandler = asyncHandler(async (req, res)=>{
    const parsed = parseBody(verifyOtpSchema, req.body)

    if(!parsed.success){
        const allErrors = parsed.error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message,
            code: issue.code,
        }));

        return res.status(400).json({
            success: false,
            message: allErrors,
            data: null
        })
    }

    const {email, otp } = sanitize(parsed.data) as typeof parsed.data;

    const otpKey = `otp:${email}`

    const storedOtpString = await client.get(otpKey)

    if(!storedOtpString){
        return res.status(400).json({
            success: false,
            messagee: "Otp expired",
            data: null
        })
    }

    const storedOtp = JSON.parse(storedOtpString)

    if(storedOtp !== otp){
        return res.status(400).json({
            success: false,
            messagee: "Invalid Otp",
            data: null
        })
    }

    await client.del(otpKey)

    const user = await userModel.findOne({email}).select("-password -__v")

    if(!user){
        return res.status(404).json({
            success: false,
            messagee: "User not found",
            data: null
        })
    }

    await generateToken(String(user._id), res)

    return res.status(200).json({
        success: true,
        message: `${user.name} logged in successfully`,
        data: user
    })
})

export const myProfileController: RequestHandler = asyncHandler(async (req , res)=>{
    const user = req.user

    return res.status(200).json({
        success: true,
        message : `${user?.name}'s profile fetched successfully`,
        data: user
    })
})

export const refreshAccessToken: RequestHandler = asyncHandler(async(req , res)=>{
    const {refreshToken} = req.cookies

    if(!refreshToken){
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token",
            data: null
        })
    }

    const decoded = await verifyRefreshToken(refreshToken)

    if(!decoded){
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token",
            data: null
        })
    }

    generateAccessToken(decoded.id, res)

    return res.status(200).json({
        success: true,
        message: "Successfully updated the access token",
        data: decoded
    })
})

export const logoutController: RequestHandler = asyncHandler(async(req , res)=>{
    const {_id, name} = req.user!

    if(!_id){
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            data: null
        })
    }

    await revokeRefreshToken(_id)

    res.clearCookie("refreshToken")
    res.clearCookie("accessToken")
    res.clearCookie("csrfToken")

    await client.del(`user:${_id}`)

    return res.status(200).json({
        success: true,
        message : `${name} logged out successfully`,
        data: req.user!
    })
})

export const refreshCsrf: RequestHandler = asyncHandler(async(req , res)=>{
    const userId = req.user?._id

    if(!userId){
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            data: null
        })
    }

    const newCsrfToken = await generateCsrfToken(userId, res)

    return res.status(200).json({
        succesS: true,
        message: "CSRF token refreshed successfully",
        data:{
            csrfToken : newCsrfToken
        }
    })
})