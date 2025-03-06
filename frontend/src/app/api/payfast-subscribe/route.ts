import { NextResponse } from "next/server";
import crypto from "crypto";
import { authAdmin } from "../../firebase/firebaseAdmin"; // ✅ Firebase Admin SDK

export async function POST(req: Request) {
  console.log("🚀 PayFast Subscription Request Received");

  // ✅ Extract Authorization token from headers
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("❌ No authentication token provided.");
    return NextResponse.json({ error: "No authentication token provided" }, { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // ✅ Verify Firebase Authentication token
    const decodedToken = await authAdmin.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    console.log("✅ User Authenticated:", userId);

    // ✅ PayFast API Credentials
    const merchantId = "10037398";
    const merchantKey = "u4xw2uwnuthmh";
    const passphrase = "Ru1j3ssale77-77"; // ✅ Ensure this matches PayFast settings

    // ✅ Payment details (DO NOT SORT PARAMETERS ALPHABETICALLY)
    const paymentData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: "https://automatic-guacamole-5gr4p7wjr4xp24w5g-3000.app.github.dev/success",
      cancel_url: "https://automatic-guacamole-5gr4p7wjr4xp24w5g-3000.app.github.dev/pricing",
      notify_url: "https://ccfb-4-240-39-195.ngrok-free.app/api/payfast-webhook",
      name_first: "Rui",
      name_last: "Calvario",
      email_address: "billing@yourwebsite.com",
      m_payment_id: "sub-" + Date.now(),
      amount: "199.00", // ✅ Ensure amount format is correct
      item_name: "Pocket Agency Monthly Subscription",
      custom_str1: userId, // ✅ Store Firebase User ID for Firestore lookup
      email_confirmation: "0", // ✅ Ensuring this is passed
      subscription_type: "1", // Recurring Subscription
      recurring_amount: "199", // ✅ No decimal places for recurring
      frequency: "3", // Every 3 days (valid for testing)
      cycles: "0", // 0 = Infinite cycles
    };

    console.log("🔹 Sending User ID to PayFast:", paymentData.custom_str1);

    // ✅ Generate PayFast Signature using the **correct** method
    const signature = generateSignature(paymentData, passphrase);

    // ✅ Construct final URL ensuring correct encoding
    const encodeValue = (key: string, value: string) => {
      if (key.includes("url")) return value; // ✅ Keep URLs unencoded
      if (key === "email_address") return value; // ✅ Keep `@` unencoded in emails
      return encodeURIComponent(value).replace(/%20/g, "%20"); // ✅ Ensure spaces use `%20`
    };

    // ✅ Use the required parameter order
    const orderedKeys = [
      "merchant_id", "merchant_key", "return_url", "cancel_url", "notify_url",
      "name_first", "name_last", "email_address", "m_payment_id", "amount",
      "item_name", "custom_str1", "email_confirmation", "subscription_type",
      "recurring_amount", "frequency", "cycles"
    ];

    const paramString = orderedKeys
      .map((key) => `${key}=${encodeValue(key, paymentData[key].trim())}`)
      .join("&");

    const payfastUrl = `https://sandbox.payfast.co.za/eng/process?${paramString}&signature=${signature}`;

    console.log("✅ Final Redirect URL Sent to PayFast:", payfastUrl);
    return NextResponse.json({ redirectUrl: payfastUrl }); // Send the redirect URL back to the client
  } catch (error) {
    console.error("🔥 Authentication Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 403 });
  }
}

// ✅ **Final Fix for Signature Generation**
const generateSignature = (data: Record<string, string>, passPhrase: string | null = null) => {
  let pfOutput = "";

  // ✅ Keep parameters in **exact order** required by PayFast
  const orderedKeys = [
    "merchant_id", "merchant_key", "return_url", "cancel_url", "notify_url",
    "name_first", "name_last", "email_address", "m_payment_id", "amount",
    "item_name", "custom_str1", "email_confirmation", "subscription_type",
    "recurring_amount", "frequency", "cycles"
  ];

  for (let key of orderedKeys) {
    if (data[key]) {
      pfOutput += `${key}=${data[key].trim()}&`; // ✅ NO ENCODING
    }
  }

  // ✅ Remove last "&"
  let signatureString = pfOutput.slice(0, -1);

  // ✅ Append passphrase (NO ENCODING)
  if (passPhrase) {
    signatureString += `&passphrase=${passPhrase.trim()}`;
  }

  console.log("🔹 Final Signature String (Before Hashing):", signatureString);

  // ✅ Generate MD5 hash
  return crypto.createHash("md5").update(signatureString, "utf8").digest("hex").toUpperCase();
};
