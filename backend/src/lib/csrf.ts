import type { Response } from "express"
import crypto from 'node:crypto'

import client from '../config/redis.config.js'

export const generateCsrfToken = async(userId: string, res : Response)=>{
    const csrfToken = crypto.randomBytes(32).toString("hex")

    const csrfKey = `csrf:${userId}`

    await client.setEx(csrfKey, 3600, csrfToken)

    res.cookie("csrfToken", csrfToken ,{
        httpOnly: false,
        secure: true,
        sameSite: "none",
        maxAge : 60*60*1000
    })

    return csrfToken
}

export const revokeCsrfToken = async(userId: string)=>{
    const csrfKey = `csrf:${userId}`

    await client.del(csrfKey)
}

export const refreshCsrfToken = async(userId: string, res: Response)=>{
    await revokeCsrfToken(userId)

    return await generateCsrfToken(userId, res)

}