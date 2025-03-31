// src/app/api/invite-admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/admin";
import { sendEmail } from "@/app/utils/email";
import nodeCrypto from "crypto";

// Generate a unique token
const generateToken = () => nodeCrypto.randomBytes(16).toString("hex");

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    // Generate a unique token
    const token = generateToken();

    // Set expiration to 24 hours from now
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Store the invitation in Firestore
    await db.collection("admin_invitations").doc(token).set({
      email,
      token,
      createdAt,
      expiresAt,
      used: false,
    });

    // Create the signup link
    const signupLink = `${
      process.env.NEXT_PUBLIC_BASE_URL || "https://pocket-agency-swart.vercel.app"
    }/admin-signup?token=${token}`;

    // Send the invitation email
    await sendEmail(
      email,
      "Pocket Agency Admin Invitation",
      `You have been invited to join Pocket Agency as an admin. Please sign up using this link: ${signupLink}`
    );

    return NextResponse.json({ message: "Invitation sent successfully" }, { status: 200 });
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error sending admin invitation:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}