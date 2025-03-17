// src/app/utils/email.ts
import nodemailer from "nodemailer";

export async function sendAssociationEmail(to: string, message: string, subject = "Associate Your Pocket Agency Account") {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // smtp.gmail.com
    port: Number(process.env.EMAIL_PORT), // 465
    secure: true, // Use SSL
    auth: {
      user: process.env.EMAIL_USER, // ruic7777@gmail.com
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || "ruic7777@gmail.com",
    to,
    subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendEmail(to: string, subject: string, message: string) {
  return sendAssociationEmail(to, message, subject);
}