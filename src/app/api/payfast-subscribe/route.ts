// src/app/api/payfast-subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodeCrypto from "crypto"; // Fixed import
import { auth, db } from "@/app/firebase/admin";
import { sendEmail } from "@/app/utils/email"; // Using standard sendEmail for consistency

export async function POST(req: NextRequest) {
  console.log("🚀 PayFast Subscription Request Received");
  const notifyUrl = process.env.PAYFAST_NOTIFY_URL || "https://pocket-agency-swart.vercel.app/api/payfast-webhook";

  const merchantId = process.env.PAYFAST_MERCHANT_ID || "10037398";
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || "u4xw2uwnuthmh";
  const passphrase = process.env.PAYFAST_PASSPHRASE || "Ru1j3ssale77-77";

  const authHeader = req.headers.get("Authorization");
  let userId: string | null = null;
  let userEmail: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      userId = decodedToken.uid;
      userEmail = decodedToken.email || null;
    } catch (error) {
      console.error("Error verifying token:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  const { plan, email }: { plan: "basic" | "pro"; email?: string } = await req.json();
  if (!plan) {
    return NextResponse.json({ error: "Plan is required" }, { status: 400 });
  }
  if (!userId && !email) {
    return NextResponse.json({ error: "Email is required for unauthenticated users" }, { status: 400 });
  }

  const amount = plan === "basic" ? "3000.00" : "8000.00"; // Updated to ZAR
  const itemName = `Pocket Agency ${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`;
  const finalEmail = userEmail || email || "temp@example.com"; // Fallback for safety

  const subscriptionRef = await db.collection("subscriptions").add({
    userId,
    plan,
    status: "pending",
    amount,
    email_address: finalEmail,
    createdAt: new Date().toISOString(),
    temp: !userId, // Flag for unauthenticated
    payfastSubscriptionId: null, // Will be set by webhook
  });
  const subscriptionId = subscriptionRef.id;

  const paymentData: [string, string][] = [
    ["merchant_id", merchantId],
    ["merchant_key", merchantKey],
    ["return_url", "https://pocket-agency-swart.vercel.app/success"],
    ["cancel_url", "https://pocket-agency-swart.vercel.app/pricing"],
    ["notify_url", notifyUrl],
    ["name_first", "Pocket Agency"],
    ["name_last", "Subscription"],
    ["email_address", finalEmail],
    ["m_payment_id", subscriptionId],
    ["amount", amount],
    ["item_name", itemName],
    ["custom_str1", "F2JhuXXHC5X63Y5MtR6PNYRKerD3"],
    ["email_confirmation", "0"],
    ["subscription_type", "1"],
    ["recurring_amount", amount],
    ["frequency", "3"], // Monthly (3 = 30 days)
    ["cycles", "0"], // Infinite cycles
  ];

  const signature = generateSignature(paymentData, passphrase);

  console.log("✅ Payment Data Prepared:", { paymentData, signature });

  // Send association email for unauthenticated users
  if (!userId) {
    const associationToken = nodeCrypto.randomBytes(16).toString("hex");
    await db.collection("subscriptions").doc(subscriptionId).update({
      associationToken,
      tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    const associationLink = `${process.env.NEXT_PUBLIC_BASE_URL || "https://pocket-agency-swart.vercel.app"}/associate-account?token=${associationToken}`;
    try {
      await sendEmail(
        finalEmail,
        "Associate Your Pocket Agency Account",
        `Please associate your account using this link: ${associationLink}`
      );
      console.log("📧 Association email sent to:", finalEmail, "Link:", associationLink);
    } catch (error) {
      console.error("Failed to send association email (continuing anyway):", error);
    }
  }

  return NextResponse.json({ paymentData, signature }, { status: 200 });
}

const generateSignature = (data: [string, string][], passPhrase: string | null = null) => {
  let pfOutput = "";
  for (const [key, value] of data) {
    if (value !== "") {
      pfOutput += `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, "+")}&`;
    }
  }
  let getString = pfOutput.slice(0, -1);
  if (passPhrase) {
    getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
  }
  console.log("🔹 PayFast Signature String (Before Hashing):", getString);
  return nodeCrypto.createHash("md5").update(getString).digest("hex").toLowerCase();
};