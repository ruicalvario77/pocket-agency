// src/app/api/payfast-webhook/route.ts
import { NextRequest } from "next/server";
const nodeCrypto = require("crypto") as typeof import("crypto");
import { db } from "@/app/firebase/admin";
import { sendEmail } from "@/app/utils/email";

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
  const signatureString = `${baseSignatureString}&passphrase=${passphrase}`;
  console.log("Signature string (with passphrase):", signatureString);

  const computedSignature = nodeCrypto
    .createHash("md5")
    .update(signatureString, "utf8")
    .digest("hex")
    .toLowerCase();
  console.log("Computed signature:", computedSignature, "Received signature:", receivedSignature);

  if (computedSignature !== receivedSignature) {
    console.error("Invalid signature:", { computedSignature, receivedSignature });
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("✅ Signature Verified");

  const { m_payment_id, payment_status, email_address, token } = data;
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
      payfastToken: token,
      updatedAt: new Date().toISOString(),
      temp: true,
      retryAttempts: 0,
      plan: subscriptionData.plan || "basic", // Default to "basic" if plan is not set
    };

    if (!subscriptionData.userId) {
      const associationToken = nodeCrypto.randomBytes(16).toString("hex");
      updateData.associationToken = associationToken;
      updateData.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const associationLink = `${process.env.NEXT_PUBLIC_BASE_URL || "https://ecc6-13-71-3-98.ngrok-free.app"}/associate-account?token=${associationToken}`;
      try {
        await sendEmail(
          email_address || "user@example.com",
          "Associate Your Pocket Agency Account",
          `Please associate your account using this link: ${associationLink}`
        );
        console.log("📧 Association email sent to:", email_address, "Link:", associationLink);
      } catch (error) {
        console.error("Failed to send association email (continuing anyway):", error);
      }
    }

    await subscriptionRef.update(updateData);
    console.log("✅ Subscription updated to active:", m_payment_id);
  } else if (payment_status === "FAILED") {
    const retryAttempts = (subscriptionData.retryAttempts || 0) + 1;
    const maxRetries = 2;

    if (retryAttempts === 1 && subscriptionData.status === "pending") {
      const updateData = {
        status: "failed",
        updatedAt: new Date().toISOString(),
        retryAttempts,
        cancellationReason: "Initial payment failure",
      };
      await subscriptionRef.update(updateData);
      console.log("❌ Initial payment failed for subscription:", m_payment_id);

      const failureMessage = `
        Dear Customer,
        Your initial subscription payment failed.
        Please retry by updating your payment method at ${process.env.NEXT_PUBLIC_BASE_URL || "https://ecc6-13-71-3-98.ngrok-free.app"}/pricing.
        If you need assistance, contact us at support@pocketagency.com.
      `;
      try {
        await sendEmail(
          email_address || "user@example.com",
          "Initial Subscription Payment Failed",
          failureMessage
        );
        console.log("📧 Initial payment failure email sent to:", email_address);
      } catch (error) {
        console.error("Failed to send initial failure email (continuing anyway):", error);
      }
    } else if (retryAttempts < maxRetries) {
      const updateData = {
        status: "pending_retry",
        retryAttempts,
        lastRetryAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await subscriptionRef.update(updateData);
      console.log(`Retry attempt ${retryAttempts}/${maxRetries} scheduled for subscription:`, m_payment_id);

      const retryMessage = `
        Dear Customer,
        We attempted to process your subscription payment but it failed.
        We will retry again in 24 hours. Please ensure your payment method is up to date.
        Update your payment method at ${process.env.NEXT_PUBLIC_BASE_URL || "https://ecc6-13-71-3-98.ngrok-free.app"}/billing.
      `;
      try {
        await sendEmail(
          email_address || "user@example.com",
          "Subscription Payment Failed - Retry Scheduled",
          retryMessage
        );
        console.log("📧 Retry notification email sent to:", email_address);
      } catch (error) {
        console.error("Failed to send retry notification email (continuing anyway):", error);
      }
    } else {
      const updateData = {
        status: "cancelled",
        updatedAt: new Date().toISOString(),
        cancellationReason: "Payment failure after retries",
        retryAttempts,
      };
      await subscriptionRef.update(updateData);
      console.log("❌ Subscription cancelled in Firestore after max retries:", m_payment_id);

      if (token) {
        try {
          const timestamp = new Date().toISOString();
          const params: { [key: string]: string } = {
            "merchant-id": process.env.PAYFAST_MERCHANT_ID || "10037398",
            "version": "v1",
            "timestamp": timestamp,
            "reason": "Payment failure after retries",
          };
          const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join("&");
          const cancelSignatureString = sortedParams + `&passphrase=${passphrase}`;
          const cancelSignature = nodeCrypto
            .createHash("md5")
            .update(cancelSignatureString)
            .digest("hex")
            .toLowerCase();

          console.log("Cancel signature params:", sortedParams);
          console.log("Cancel signature string:", cancelSignatureString);
          console.log("Cancel signature:", cancelSignature);

          const cancelResponse = await fetch(`https://api.payfast.co.za/subscriptions/${token}/cancel`, {
            method: "PUT",
            headers: {
              "merchant-id": process.env.PAYFAST_MERCHANT_ID || "10037398",
              "version": "v1",
              "timestamp": timestamp,
              "signature": cancelSignature,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(params).toString(),
          });

          const responseText = await cancelResponse.text();
          if (!cancelResponse.ok) {
            console.error("Failed to cancel PayFast subscription:", responseText);
          } else {
            console.log("✅ PayFast subscription cancelled:", token);
            console.log("Response:", responseText);
          }
        } catch (error) {
          console.error("Error cancelling PayFast subscription (continuing anyway):", error);
        }
      } else {
        console.warn("No PayFast token found for cancellation:", m_payment_id);
      }

      const cancellationMessage = `
        Dear Customer,
        Your Pocket Agency subscription has been cancelled due to repeated payment failures.
        Please resubscribe at ${process.env.NEXT_PUBLIC_BASE_URL || "https://ecc6-13-71-3-98.ngrok-free.app"}/pricing to continue using our services.
      `;
      try {
        await sendEmail(
          email_address || "user@example.com",
          "Subscription Cancelled Due to Payment Failure",
          cancellationMessage
        );
        console.log("📧 Cancellation email sent to:", email_address);
      } catch (error) {
        console.error("Failed to send cancellation email (continuing anyway):", error);
      }
    }
  }

  return new Response(null, { status: 200 });
}