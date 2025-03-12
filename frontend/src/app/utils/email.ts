// src/app/utils/email.ts
import nodemailer from "nodemailer";

export async function sendAssociationEmail(to: string, link: string): Promise<void> {
  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email configuration missing: EMAIL_USER and EMAIL_PASS must be set in .env.local");
    throw new Error("Email service not configured");
  }

  // Configure Nodemailer transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: "Pocket Agency <no-reply@pocketagency.com>",
      to,
      subject: "Associate Your Subscription",
      html: `Click <a href="${link}">here</a> to associate your subscription with an account. This link expires in 24 hours.`,
    });
    console.log(`Association email sent to ${to} with link: ${link}`);
  } catch (error) {
    console.error("Failed to send association email:", error);
    throw new Error("Failed to send association email");
  }
}