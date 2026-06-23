import type { Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { config } from "../config/env.config.js"

import client from "../config/redis.config.js"
import { generateCsrfToken, revokeCsrfToken } from "./csrf.js"

const ACCESS_TOKEN_SECRET = config.JWT.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = config.JWT.REFRESH_TOKEN_SECRET

if(!ACCESS_TOKEN_SECRET){
    throw new Error("Access token secret is missing")
}

if(!REFRESH_TOKEN_SECRET){
    throw new Error("Refresh token secret is missing")
}

const generateToken = async(id: string, res: Response)=>{
    const accessToken = jwt.sign({id}, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })

    const refreshToken = jwt.sign({id}, REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    })

    const refreshTokenKey = `refresh_token:${id}`

    await client.setEx(refreshTokenKey, 7*24*60*60, refreshToken)

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15*60*1000
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7*24*60*60*1000
    })

    const csrfToken = await generateCsrfToken(id, res)

    return {accessToken, refreshToken, csrfToken}
}

export const verifyRefreshToken = async(refreshToken: string)=>{
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload

        const storedRefreshToken = await client.get(`refresh_token:${decoded.id}`)

        if(storedRefreshToken === refreshToken){
            return decoded
        }

        return null
    } catch (error) {
        return null
    }
}

export const generateAccessToken = (id: string, res: Response)=>{
    const accessToken = jwt.sign({id}, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15*60*1000
    })
}

export const revokeRefreshToken = async(userId: string)=>{
    await client.del(`refresh_token:${userId}`)

    await revokeCsrfToken(userId)
}

export default generateToken