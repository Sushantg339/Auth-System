import nodemailer from "nodemailer"
import {config} from "./env.config.js"

const transporter = nodemailer.createTransport({
    host: config.mail.host,
    auth:{
        user: config.mail.user,
        pass: config.mail.pass
    }
})

export default transporter