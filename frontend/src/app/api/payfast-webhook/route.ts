// src/app/api/payfast-webhook/route.ts
import { NextRequest } from "next/server";
const nodeCrypto = require("crypto") as typeof import("crypto");
import { db } from "@/app/firebase/admin";
import { sendAssociationEmail } from "@/app/utils/email";

export async function POST(req: NextRequest) {
  console.log("🚀 PayFast Webhook Received");

  const body = await req.text();
  console.log("Raw body:", body);
  console.log("Raw body length:", body.length);

  const pairs: [string, string][] = body.split("&").map((pair) => {
    const [key, ...valueParts] = pair.split("=");
    const rawValue = valueParts.join("=") || "";
    return [key, rawValue] as [string, string];
  });
  const data: Record<string, string> = {};
  for (const [key, value] of pairs) {
    data[key] = decodeURIComponent(value);
  }
  console.log("Ordered pairs (raw):", pairs);

  if (!data.signature) {
    console.error("No signature provided in payload");
    return new Response(JSON.stringify({ error: "No signature provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const receivedSignature = data.signature;

  const baseSignatureString = body.split("&").filter(param => !param.startsWith("signature=")).join("&");
  const passphrase = process.env.PAYFAST_PASSPHRASE || "Ru1j3ssale77-77";
  const signatureString = `${baseSignatureString}&passphrase=${passphrase}`; // No encodeURIComponent
  console.log("Signature string (with passphrase):", signatureString);
  console.log("Signature string length:", signatureString.length);

  const computedSignature = nodeCrypto
    .createHash("md5")
    .update(signatureString, "utf8")
    .digest("hex")
    .toLowerCase();
  console.log("Computed signature:", computedSignature, "Received signature:", receivedSignature);

  const expectedTesterHash = "9afe2f590ac1b342f765b676c7a3d7fa";
  console.log("ITN Tester expected hash:", expectedTesterHash);

  if (computedSignature !== receivedSignature) {
    console.error("Invalid signature:", { computedSignature, receivedSignature });
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("✅ Signature Verified");

  const { m_payment_id, payment_status, email_address } = data;
  if (!m_payment_id || !payment_status) {
    console.error("Missing required fields:", { m_payment_id, payment_status });
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("Processing subscription:", m_payment_id, "Status:", payment_status);

  const subscriptionRef = db.collection("subscriptions").doc(m_payment_id);
  const subscription = await subscriptionRef.get();

  if (!subscription.exists) {
    console.error("Subscription not found:", m_payment_id);
    return new Response(JSON.stringify({ error: "Subscription not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const subscriptionData = subscription.data()!;
  if (payment_status === "COMPLETE") {
    const updateData: Record<string, any> = {
      status: "active",
      payfastSubscriptionId: m_payment_id,
      updatedAt: new Date().toISOString(),
    };

    if (!subscriptionData.userId) {
      const associationToken = nodeCrypto.randomBytes(16).toString("hex");
      updateData.associationToken = associationToken;
      updateData.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const associationLink = `${process.env.NEXT_PUBLIC_BASE_URL || "https://f9a6-20-192-21-53.ngrok-free.app"}/associate-account?token=${associationToken}`;
      await sendAssociationEmail(email_address || "user@example.com", associationLink);
      console.log("📧 Association email sent to:", email_address, "Link:", associationLink);
    }

    await subscriptionRef.update(updateData);
    console.log("✅ Subscription updated to active:", m_payment_id);
  } else if (payment_status === "FAILED") {
    await subscriptionRef.update({ status: "failed" });
    console.log("❌ Subscription updated to failed:", m_payment_id);
  }

  return new Response(null, { status: 200 });
}