import type { SentMessageInfo } from "nodemailer";
import { config } from "../config/env.config.js"

import transporter from "../config/mail.config.js";

interface SendMailOptions {
    email: string;
    subject: string;
    html: string;
}

export const sendMail = async ({ email, subject, html }: SendMailOptions): Promise<SentMessageInfo> => {
    return await transporter.sendMail({
        from: config.mail.user,
        to: email,
        subject,
        html,
    });
};