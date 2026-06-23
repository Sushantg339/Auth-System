import type { RequestHandler } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"

import { config } from "../config/env.config.js"

import client from "../config/redis.config.js"
import userModel from "../models/user.model.js"

const ACCESS_TOKEN_SECRET = config.JWT.ACCESS_TOKEN_SECRET

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
            }
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

        const cacheUser = await client.get(`user:${decoded.id}`)

        if(cacheUser){
            req.user = JSON.parse(cacheUser)
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

        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            data: null
        })
    }
}


export default authMiddleware