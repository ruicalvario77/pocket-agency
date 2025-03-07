// src/app/utils/email.ts
import nodemailer from "nodemailer";

export async function sendAssociationEmail(to: string, link: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "Pocket Agency <no-reply@pocketagency.com>",
    to,
    subject: "Associate Your Subscription",
    html: `Click <a href="${link}">here</a> to associate your subscription with an account. This link expires in 24 hours.`,
  });
}