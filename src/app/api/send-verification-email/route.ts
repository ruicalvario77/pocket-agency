// src/app/api/send-verification-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/admin";
import { sendEmail } from "@/app/utils/email";
import nodeCrypto from "crypto";

// Generate a random token
const generateToken = () => nodeCrypto.randomBytes(16).toString("hex");

export async function POST(req: NextRequest) {
  const { email, userId } = await req.json();

  if (!email || !userId) {
    console.error("Missing email or userId:", { email, userId });
    return NextResponse.json({ error: "Missing email or userId" }, { status: 400 });
  }

  try {
    // Log environment variables for debugging
    console.log("Email configuration:", {
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS ? "[REDACTED]" : "undefined",
      EMAIL_FROM: process.env.EMAIL_FROM,
    });

    // Generate a random token
    const token = generateToken();

    // Store the token in the user's Firestore document
    const userDocRef = db.collection("users").doc(userId);
    await userDocRef.update({ verificationToken: token });

    // Create the verification link
    const verificationLink = `${
      process.env.NEXT_PUBLIC_BASE_URL || "https://pocket-agency-swart.vercel.app"
    }/verify-email?token=${token}&userId=${userId}`;

    // Send the verification email
    try {
      await sendEmail(
        email,
        "Verify Your Email - Pocket Agency",
        `Please verify your email by clicking this link: ${verificationLink}`
      );
      console.log("Verification email sent successfully to:", email);
    } catch (emailError: unknown) {
      console.error("Detailed email sending error:", emailError);
      throw new Error(`Failed to send email: ${emailError instanceof Error ? emailError.message : "Unknown error"}`);
    }

    return NextResponse.json({ message: "Verification email sent" }, { status: 200 });
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error sending verification email:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}