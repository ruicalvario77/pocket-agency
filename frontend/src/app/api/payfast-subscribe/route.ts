// src/app/api/payfast-subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth, db } from "@/app/firebase/admin";

export async function POST(req: NextRequest) {
  console.log("🚀 PayFast Subscription Request Received");
  console.log("Using PAYFAST_NOTIFY_URL:", process.env.PAYFAST_NOTIFY_URL);

  const merchantId = process.env.PAYFAST_MERCHANT_ID || "10037398";
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || "u4xw2uwnuthmh";
  const passphrase = process.env.PAYFAST_PASSPHRASE || "Ru1j3ssale77-77";
  const notifyUrl = process.env.PAYFAST_NOTIFY_URL || "https://f9a6-20-192-21-53.ngrok-free.app/api/payfast-webhook";

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

  const { plan }: { plan: "basic" | "pro" } = await req.json();
  if (!plan) {
    return NextResponse.json({ error: "Plan is required" }, { status: 400 });
  }

  const amount = plan === "basic" ? "199.00" : "399.00";
  const itemName = `Pocket Agency ${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`;

  const subscriptionRef = await db.collection("subscriptions").add({
    userId,
    plan,
    status: "pending",
    amount,
    createdAt: new Date().toISOString(),
  });
  const subscriptionId = subscriptionRef.id;

  // Define payment data in the exact order specified
  const paymentData: [string, string][] = [
    ["merchant_id", merchantId],
    ["merchant_key", merchantKey],
    ["return_url", "https://automatic-guacamole-5gr4p7wjr4xp24w5g-3000.app.github.dev/success"],
    ["cancel_url", "https://automatic-guacamole-5gr4p7wjr4xp24w5g-3000.app.github.dev/pricing"],
    ["notify_url", notifyUrl],
    ["name_first", "Pocket Agency"],
    ["name_last", "Subscription"],
    ["email_address", "billing@yourwebsite.com"],
    ["m_payment_id", subscriptionId],
    ["amount", amount],
    ["item_name", itemName],
    ["custom_str1", "F2JhuXXHC5X63Y5MtR6PNYRKerD3"],
    ["email_confirmation", "0"],
    ["subscription_type", "1"],
    ["recurring_amount", amount],
    ["frequency", "3"],
    ["cycles", "0"],
  ];

  const signature = generateSignature(paymentData, passphrase);

  // Construct the final URL
  const baseUrl = "https://sandbox.payfast.co.za/eng/process";
  const queryString = paymentData
    .map(([key, value]) => `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, "+")}`)
    .join("&") + `&signature=${signature}`;
  const finalUrl = `${baseUrl}?${queryString}`;

  console.log("✅ Final URL sent to PayFast:", finalUrl);
  console.log("✅ Payment Data Prepared:", { paymentData, signature });

  return NextResponse.json({ paymentData, signature, finalUrl }, { status: 200 });
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
  return crypto.createHash("md5").update(getString).digest("hex").toLowerCase();
};