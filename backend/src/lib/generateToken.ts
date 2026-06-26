import type { Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import crypto from "node:crypto"
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
    const sessionId = crypto.randomBytes(16).toString("hex")

    const accessToken = jwt.sign({id, sessionId}, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })

    const refreshToken = jwt.sign({id, sessionId}, REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    })

    const refreshTokenKey = `refresh_token:${id}`
    const activeSessionKey = `active_session:${id}`
    const sessionDataKey = `session:${sessionId}`

    const existingSession = await client.get(activeSessionKey)

    if(existingSession){
        await client.del(`session:${existingSession}`)
        await client.del(refreshTokenKey)
    }

    const sessionData = {
        userId: id,
        sessionId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
    }

    await client.setEx(refreshTokenKey, 7*24*60*60, refreshToken)
    await client.setEx(activeSessionKey, 7*24*60*60, sessionId)
    await client.setEx(sessionDataKey, 7*24*60*60, JSON.stringify(sessionData))

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

    return {accessToken, refreshToken, csrfToken, sessionId}
}

export const verifyRefreshToken = async(refreshToken: string)=>{
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload

        const storedRefreshToken = await client.get(`refresh_token:${decoded.id}`)

        if(storedRefreshToken !== refreshToken){
            return null
        }

        const activeSessionId = await client.get(`active_session:${decoded.id}`)

        if(activeSessionId !== decoded.sessionId){
            return null
        }

        const sessionData = await client.get(`session:${decoded.sessionId}`)

        if(!sessionData){
            return null
        }

        const parsedSessionData = JSON.parse(sessionData)

        parsedSessionData.lastActivity = new Date().toISOString()

        await client.setEx(`session:${decoded.sessionId}`, 7*24*60*60 , JSON.stringify(parsedSessionData))

        return decoded
    } catch (error) {
        return null
    }
}

export const generateAccessToken = (id: string, sessionId: string, res: Response)=>{
    const accessToken = jwt.sign({id, sessionId}, ACCESS_TOKEN_SECRET, {
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
    const activeSessionId = await client.get(`active_session:${userId}`)
    await client.del(`refresh_token:${userId}`)

    await client.del(`active_session:${userId}`)

    if(activeSessionId){
        await client.del(`session:${activeSessionId}`)
    }

    await revokeCsrfToken(userId)
}

export const isSessionActive = async(userId: string, sessionId: string)=>{
    const activeSessionId = await client.get(`active_session:${userId}`)

    return activeSessionId === sessionId
}


export default generateToken