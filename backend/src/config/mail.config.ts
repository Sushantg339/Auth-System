import nodemailer from "nodemailer"
import {config} from "./env.config.js"

const transporter = nodemailer.createTransport({
    host: config.MAIL.HOST,
    auth:{
        user: config.MAIL.USER,
        pass: config.MAIL.PASS
    }
})

export default transporter