import type { RequestHandler } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"

import client from "../config/redis.config.js"
import userModel from "../models/user.model.js"
import { isSessionActive } from "../lib/generateToken.js"

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

if(!ACCESS_TOKEN_SECRET){
    throw new Error("Access token secret is missing")
}


declare global{
    namespace Express{
        interface Request{
            user?:{
                _id: string,
                name: string,
                email: string,
                role: string
            },
            sessionId?: string
        }
    }
}

const authMiddleware: RequestHandler = async(req , res, next)=>{
    try {
        const {accessToken} = req.cookies

        if(!accessToken){
            return res.status(403).json({
                success: false,
                message: "Token missing. Please login again",
                data: null
            })
        }
        
        const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as JwtPayload

        if(!decoded){
            return res.status(403).json({
                success: false,
                message: "Invalid Token. Login again",
                data: null
            })
        }

        const isActiveSession = await isSessionActive(decoded.id, decoded.sessionId)

        if(!isActiveSession){
            res.clearCookie("refreshToken")
            res.clearCookie("accessToken")
            res.clearCookie("csrfToken")

            return res.status(401).json({
                success: false,
                message: "Session Expired. You have been logged in from another device"
            })
        }

        const sessionKey = `session:${decoded.sessionId}`

        const session = await client.get(sessionKey)

        if (session) { 
            const parsedSession = JSON.parse(session) 
            parsedSession.lastActivity = new Date().toISOString()
            await client.setEx( sessionKey, 7 * 24 * 60 * 60, JSON.stringify(parsedSession) )
        }

        const cachedUser = await client.get(`user:${decoded.id}`)

        if(cachedUser){
            req.user = JSON.parse(cachedUser)
            req.sessionId = decoded.sessionId
            return next()
        }

        const user = await userModel.findById(decoded.id).select("-password -__v -createdAt -updatedAt")

        if(!user){
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Login/Signup again",
                data: null
            })
        }

        await client.setEx(`user:${user._id}`, 60*60, JSON.stringify(user))

        req.user = {
            _id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role
        }
        req.sessionId = decoded.sessionId

        next()
    } catch (error) {
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        res.clearCookie("csrfToken")
        
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            data: null
        })
    }
}


export default authMiddleware