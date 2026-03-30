import nodemailer from "nodemailer";
import { getEnv } from "../config/env";
import { logger } from "./logger";
import dotenv from "dotenv";

dotenv.config();

export async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.MAIL_HOST) {
    logger.warn({ to, subject }, "MAIL_HOST not configured. Email logged only.");
    logger.info({ to, subject, html }, "Mock email payload");
    return;
  }
  
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: true,
    auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  });

  await transporter.sendMail({
    from: `"Job Tracker" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
}
