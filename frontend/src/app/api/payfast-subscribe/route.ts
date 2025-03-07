// src/app/api/payfast-subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/app/firebase/admin";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  let userId: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      userId = decodedToken.uid;
    } catch (error) {
      console.error("Error verifying token:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  const { plan } = await req.json();

  const subscriptionRef = await db.collection("subscriptions").add({
    userId, // Null for guests
    plan,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  const subscriptionId = subscriptionRef.id;
  const payfastUrl = `https://www.payfast.co.za/eng/process?cmd=_paynow&custom_str1=${subscriptionId}&amount=100&plan=${plan}`;

  return NextResponse.json({ redirectUrl: payfastUrl }, { status: 200 });
}