import type { SentMessageInfo } from "nodemailer";

import transporter from "../config/mail.config.js";

interface SendMailOptions {
    email: string;
    subject: string;
    html: string;
}

export const sendMail = async ({ email, subject, html }: SendMailOptions): Promise<SentMessageInfo> => {
    return await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject,
        html,
    });
};