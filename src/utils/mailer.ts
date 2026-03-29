import nodemailer from "nodemailer";
import { getEnv } from "../config/env.js";
import { logger } from "./logger.js";

export async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.MAIL_HOST) {
    logger.warn({ to, subject }, "MAIL_HOST not configured. Email logged only.");
    logger.info({ to, subject, html }, "Mock email payload");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: getEnv("MAIL_HOST"),
    port: Number(process.env.MAIL_PORT || 587),
    auth: {
      user: getEnv("MAIL_USER"),
      pass: getEnv("MAIL_PASS")
    }
  });

  await transporter.sendMail({
    from: getEnv("MAIL_FROM"),
    to,
    subject,
    html
  });
}
