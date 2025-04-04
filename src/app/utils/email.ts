// src/app/utils/email.ts
import nodemailer from "nodemailer";

export async function sendAssociationEmail(to: string, message: string, subject = "Associate Your Pocket Agency Account") {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || "ruic7777@gmail.com",
      to,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Error in sendAssociationEmail:", error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

export async function sendEmail(to: string, subject: string, message: string) {
  try {
    return await sendAssociationEmail(to, message, subject);
  } catch (error) {
    console.error("Error in sendEmail:", error);
    throw error; // Re-throw the error to be caught by the caller
  }
}