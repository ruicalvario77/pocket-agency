// src/app/api/send-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { to, projectTitle, status } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App Password
    },
  });

  const statusMessages: { [key: string]: string } = {
    pending: "Your project has been submitted and is awaiting review.",
    in_progress: "Your project is now being worked on by our team.",
    completed: "Your project is complete! Please review the results.",
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Pocket Agency: "${projectTitle}" Status Update`,
    text: `Your project "${projectTitle}" has been updated to "${status}". ${statusMessages[status] || "Status updated."}`,
    html: `<p>Your project "<strong>${projectTitle}</strong>" has been updated to "<strong>${status}</strong>".</p><p>${statusMessages[status] || "Status updated."}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Project update email sent successfully to:", to);
    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to send project update email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}