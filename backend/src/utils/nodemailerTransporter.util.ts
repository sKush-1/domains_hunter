import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.hostinger.com
  port: process.env.SMTP_PORT, // 465
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER, // team@domainshunter.in
    pass: process.env.EMAIL_PASS,
  },
  pool: true, // reuse connections
  maxConnections: 5,
  maxMessages: 100,
});
