import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAuth } from "firebase/auth";

export async function POST() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  console.log("✅ Sending User ID to PayFast:", user.uid);

  // PayFast API Credentials (Replace with your credentials)
  const merchantId = "10037398";
  const merchantKey = "u4xw2uwnuthmh";
  const passphrase = "Ru1j3ssale77-77"; // Ensure this is correct

  // Payment details (DO NOT SORT PARAMETERS ALPHABETICALLY)
  const paymentData = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: "https://automatic-guacamole-5gr4p7wjr4xp24w5g-3000.app.github.dev/success",
    cancel_url: "https://automatic-guacamole-5gr4p7wjr4xp24w5g-3000.app.github.dev/pricing",
    notify_url: "https://1542-20-192-21-51.ngrok-free.app/api/payfast-webhook",
    name_first: "Pocket Agency",
    name_last: "Subscription",
    email_address: "billing@yourwebsite.com",
    m_payment_id: "sub-" + Date.now(), // Unique ID for this subscription
    amount: "199.00",
    item_name: "Pocket Agency Monthly Subscription",
    subscription_type: "1", // Recurring Subscription
    frequency: "3", // Weekly subscription (valid value)
    cycles: "0", // 0 = Infinite cycles
    custom_str1: user.uid, // Store Firebase User ID
  };

  // Generate PayFast Signature
  const signature = generateSignature(paymentData, passphrase);

  // Construct final URL
  const paramString = Object.entries(paymentData)
    .map(([key, value]) => `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, "+")}`)
    .join("&");

  const payfastUrl = `https://sandbox.payfast.co.za/eng/process?${paramString}&signature=${signature}`;

  return NextResponse.redirect(payfastUrl);
}

// Function to generate the PayFast signature correctly
const generateSignature = (data: Record<string, string>, passPhrase: string | null = null) => {
  let pfOutput = "";
  const keys = [
    "merchant_id", "merchant_key", "return_url", "cancel_url", "notify_url",
    "name_first", "name_last", "email_address", "m_payment_id", "amount",
    "item_name", "subscription_type", "frequency", "cycles", "custom_str1"
  ];

  for (let key of keys) {
    if (data[key]) {
      pfOutput += `${key}=${data[key].trim().replace(/ /g, "+")}&`;
    }
  }

  let getString = pfOutput.slice(0, -1);
  if (passPhrase) {
    getString += `&passphrase=${passPhrase.trim().replace(/ /g, "+")}`;
  }

  return crypto.createHash("md5").update(getString).digest("hex");
};
