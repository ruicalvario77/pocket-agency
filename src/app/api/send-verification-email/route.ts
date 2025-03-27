// src/app/api/send-verification-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/firebase/admin";
import { sendEmail } from "@/app/utils/email";
import nodeCrypto from "crypto";

export async function POST(req: NextRequest) {
  const { email, userId } = await req.json();

  if (!email || !userId) {
    return NextResponse.json({ error: "Missing email or userId" }, { status: 400 });
  }

  try {
    // Generate a verification token
    const verificationToken = nodeCrypto.randomBytes(16).toString("hex");

    // Store the token in Firestore (or another collection if preferred)
    await auth.setCustomUserClaims(userId, { verificationToken });

    // Create the verification link
    const verificationLink = `${
      process.env.NEXT_PUBLIC_BASE_URL || "https://pocket-agency.vercel.app"
    }/verify-email?token=${verificationToken}&userId=${userId}`;

    // Send the verification email
    await sendEmail(
      email,
      "Verify Your Pocket Agency Account",
      `Please verify your email by clicking this link: ${verificationLink}`
    );

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