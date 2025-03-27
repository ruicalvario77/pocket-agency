// src/app/api/clear-verification-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/firebase/admin";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // Clear the verification token from custom claims
    await auth.setCustomUserClaims(userId, { verificationToken: null });
    return NextResponse.json({ message: "Verification token cleared" }, { status: 200 });
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error clearing verification token:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}