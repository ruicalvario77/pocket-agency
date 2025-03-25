// src/app/api/payfast-cancel-subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/admin";
import { getAuth } from "firebase-admin/auth";
import nodeCrypto from "crypto"; // Fixed import
import { sendEmail } from "@/app/utils/email";

export async function POST(req: NextRequest) {
  const auth = getAuth();
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedToken = await auth.verifyIdToken(token);
  const userId = decodedToken.uid;

  const subscriptionRef = db.collection("subscriptions").where("userId", "==", userId).limit(1);
  const subscriptionSnap = await subscriptionRef.get();
  if (subscriptionSnap.empty) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  const subscriptionDoc = subscriptionSnap.docs[0];
  const currentData = subscriptionDoc.data();
  if (currentData.status === "CANCELLED") {
    return NextResponse.json({ error: "Subscription already cancelled" }, { status: 400 });
  }

  const passphrase = process.env.PAYFAST_PASSPHRASE || "Ru1j3ssale77-77";
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "+02:00");
  const merchantId = process.env.PAYFAST_MERCHANT_ID || "10037398";
  const version = "v1";

  // Header parameters (excluding signature)
  const headerParams: { [key: string]: string } = {
    "merchant-id": merchantId,
    "timestamp": timestamp,
    "version": version,
  };

  // Signature based on header parameters (no body for cancel)
  const signatureParams = Object.keys(headerParams)
    .sort()
    .map(key => `${key}=${encodeURIComponent(headerParams[key]).replace(/%20/g, '+')}`)
    .join("&");
  const signatureString = `${signatureParams}&passphrase=${passphrase}`;
  const signature = nodeCrypto
    .createHash("md5")
    .update(signatureString)
    .digest("hex")
    .toLowerCase();

  // Manual log to avoid serialization issues
  const logSignatureString = `${signatureParams}&passphrase=${passphrase}`;
  console.log("Canceling PayFast subscription with header params:", headerParams);
  console.log("Signature string (logged):", logSignatureString);
  console.log("Generated signature:", signature);
  console.log("Using subscription token:", currentData.payfastToken);

  try {
    const response = await fetch(
      `https://api.payfast.co.za/subscriptions/${currentData.payfastToken}/cancel?testing=true`,
      {
        method: "PUT",
        headers: {
          "merchant-id": merchantId,
          "version": version,
          "timestamp": timestamp,
          "signature": signature,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const responseText = await response.text();
    console.log("PayFast API response status:", response.status);
    console.log("PayFast API response text:", responseText);

    if (!response.ok) {
      console.error("Failed to cancel PayFast subscription:", responseText);
      return NextResponse.json({ error: "Failed to cancel subscription", details: responseText }, { status: 500 });
    }

    console.log("PayFast subscription canceled:", responseText);

    // Update Firestore
    await subscriptionDoc.ref.update({
      status: "CANCELLED",
      updatedAt: new Date().toISOString(),
    });

    // Send cancellation email
    await sendEmail(
      currentData.email_address,
      "Subscription Cancelled",
      `Dear Customer,
      Your subscription has been successfully cancelled.
      You will no longer be billed. If you have any questions, please contact support.`
    );

    return NextResponse.json({ message: "Subscription cancelled" });
  } catch (error: unknown) {
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    console.error("Error canceling PayFast subscription:", errorMessage);
    return NextResponse.json({ error: "Error canceling subscription", details: errorMessage }, { status: 500 });
  }
}