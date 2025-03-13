// src/app/utils/email.ts
import nodemailer from "nodemailer";

export async function sendAssociationEmail(to: string, associationLink: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Associate Your Pocket Agency Subscription",
    text: `Please click the link to associate your account: ${associationLink}`,
    html: `<p>Please click the link to associate your account: <a href="${associationLink}">${associationLink}</a></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Association email sent successfully to:", to);
  } catch (error) {
    console.error("Failed to send association email:", error);
    throw new Error("Failed to send association email");
  }
}