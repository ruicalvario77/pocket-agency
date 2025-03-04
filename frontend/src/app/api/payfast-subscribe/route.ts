import { NextResponse } from "next/server";
import crypto from "crypto";
import { authAdmin } from "../../firebase/firebaseAdmin"; // ✅ Firebase Admin SDK for authentication verification

export async function POST(req: Request) {
  console.log("🚀 PayFast Subscription Request Received");

  // Extract Authorization token from headers
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("❌ No authentication token provided.");
    return NextResponse.json({ error: "No authentication token provided" }, { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // ✅ Verify the Firebase Authentication token
    const decodedToken = await authAdmin.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    console.log("✅ User Authenticated:", userId);

    // ✅ PayFast API Credentials
    const merchantId = "10037398";
    const merchantKey = "u4xw2uwnuthmh";
    const passphrase = "Ru1j3ssale77-77"; // Ensure this matches the passphrase in PayFast settings

    // ✅ Payment details (DO NOT SORT PARAMETERS ALPHABETICALLY)
    const paymentData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: "https://automatic-guacamole-5gr4p7wjr4xp24w5g-3000.app.github.dev/success",
      cancel_url: "https://automatic-guacamole-5gr4p7wjr4xp24w5g-3000.app.github.dev/pricing",
      notify_url: "https://1542-20-192-21-51.ngrok-free.app/api/payfast-webhook",
      name_first: "Pocket Agency",
      name_last: "Subscription",
      email_address: "billing@yourwebsite.com",
      m_payment_id: "sub-" + Date.now(),
      amount: "199.00",
      item_name: "Pocket Agency Monthly Subscription",
      subscription_type: "1", // Recurring Subscription
      frequency: "3", // Every 3 days (valid for testing)
      cycles: "0", // 0 = Infinite cycles
      custom_str1: userId, // ✅ Store Firebase User ID for Firestore lookup
    };

    console.log("🔹 Sending User ID to PayFast:", paymentData.custom_str1);

    // ✅ Generate PayFast Signature
    const signature = generateSignature(paymentData, passphrase);

    // ✅ Construct final URL (Ensure proper encoding)
    const paramString = Object.keys(paymentData)
      .map((key) => `${key}=${encodeURIComponent(paymentData[key].trim()).replace(/%20/g, "+")}`)
      .join("&");

    const payfastUrl = `https://sandbox.payfast.co.za/eng/process?${paramString}&signature=${signature}`;

    console.log("✅ Final Redirect URL:", payfastUrl);
    return NextResponse.json({ redirectUrl: payfastUrl }); // Send the redirect URL back to the client
  } catch (error) {
    console.error("🔥 Authentication Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 403 });
  }
}

// ✅ Function to Generate PayFast Signature (Fixes Signature Mismatch)
const generateSignature = (data: Record<string, string>, passPhrase: string | null = null) => {
  let pfOutput = "";

  // ✅ Create parameter string using ONLY non-empty values
  for (let key of Object.keys(data)) {
    if (data[key] !== "") {
      pfOutput += `${key}=${data[key].trim().replace(/ /g, "+")}&`;
    }
  }

  // ✅ Remove the last ampersand (&)
  let getString = pfOutput.slice(0, -1);

  // ✅ Append passphrase if required
  if (passPhrase) {
    getString += `&passphrase=${passPhrase.trim().replace(/ /g, "+")}`;
  }

  console.log("🔹 PayFast Signature String (Before Hashing):", getString);

  // ✅ Generate MD5 hash (as lowercase, per PayFast docs)
  return crypto.createHash("md5").update(getString, "utf8").digest("hex").toLowerCase();
};
