import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth, db } from '@/app/firebase/admin';

export async function POST() {
  console.log("🚀 PayFast Subscription Request Received");

  // PayFast API Credentials
  const merchantId = "10037398";
  const merchantKey = "u4xw2uwnuthmh";
  const passphrase = "Ru1j3ssale77-77"; // Ensure this is correct and matches PayFast settings

  // Payment details (DO NOT SORT PARAMETERS ALPHABETICALLY)
  const paymentData = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: "https://automatic-guacamole-5gr4p7wjr4xp24w5g-3000.app.github.dev/success",
    cancel_url: "https://automatic-guacamole-5gr4p7wjr4xp24w5g-3000.app.github.dev/pricing",
    notify_url: "https://a1b4-20-192-21-48.ngrok-free.app/api/payfast-webhook",
    name_first: "Pocket Agency",
    name_last: "Subscription",
    email_address: "billing@yourwebsite.com",
    m_payment_id: "sub-" + Date.now(),
    amount: "199.00",
    item_name: "Pocket Agency Monthly Subscription",
    subscription_type: "1",
    frequency: "3",
    cycles: "0",
  };

  // Generate PayFast Signature
  const signature = generateSignature(paymentData, passphrase);

  // Construct final URL (Ensure proper encoding)
  const paramString = Object.entries(paymentData)
    .map(([key, value]) => `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, "+")}`)
    .join("&");

  const payfastUrl = `https://sandbox.payfast.co.za/eng/process?${paramString}&signature=${encodeURIComponent(signature)}`;

  console.log("✅ Final Redirect URL:", payfastUrl);
  return NextResponse.redirect(payfastUrl, 303);
}

// Generate PayFast Signature
const generateSignature = (data: Record<string, string>, passPhrase: string | null = null) => {
  let pfOutput = "";

  // Create parameter string using ONLY non-empty values
  for (let key in data) {
    if (data.hasOwnProperty(key) && data[key] !== "") {
      pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`;
    }
  }

  // Remove the last ampersand (&)
  let getString = pfOutput.slice(0, -1);

  // Append passphrase if required
  if (passPhrase) {
    getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
  }

  console.log("🔹 PayFast Signature String (Before Hashing):", getString);

  // Generate MD5 hash and return in lowercase
  return crypto.createHash("md5").update(getString).digest("hex").toLowerCase();
};
