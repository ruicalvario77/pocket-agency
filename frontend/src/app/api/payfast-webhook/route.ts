import { NextResponse } from "next/server";
import { db } from "../../firebase/firebaseConfig";
import { doc, setDoc, collection } from "firebase/firestore";
import crypto from "crypto";

const PAYFAST_MERCHANT_ID = "10037398";
const PAYFAST_PASS_PHRASE = "Ru1j3ssale77-77"; // ✅ Ensure this is correct

export async function POST(req: Request) {
  console.log("🚀 PayFast Webhook Received!");

  try {
    // ✅ Log raw request for debugging
    const rawText = await req.text();
    console.log("🔹 RAW WEBHOOK REQUEST:", rawText);

    // ✅ Parse form data
    const data = new URLSearchParams(rawText);
    console.log("✅ Webhook Data (Parsed):", Object.fromEntries(data.entries()));

    // ✅ Extract required fields
    const m_payment_id = data.get("m_payment_id");
    const pf_payment_status = data.get("payment_status");
    const userId = data.get("custom_str1")?.toString();
    const payfast_signature = data.get("signature");

    console.log("📝 Extracted Data:");
    console.log("➡️ m_payment_id:", m_payment_id);
    console.log("➡️ pf_payment_status:", pf_payment_status);
    console.log("➡️ userId:", userId || "❌ MISSING USER ID");
    console.log("➡️ PayFast Signature:", payfast_signature);

    if (!userId) {
      console.warn("❌ No user ID found in webhook.");
      return NextResponse.json({ message: "Missing user ID" }, { status: 400 });
    }

    // ✅ **Temporarily bypass signature validation for testing**
    // console.warn("⚠️ Skipping signature validation for testing.");
    // return NextResponse.json({ message: "Signature bypassed for testing" });

    // ✅ **Validate the PayFast Signature**
    const isValidSignature = verifyPayfastSignature(data, payfast_signature || "");
    if (!isValidSignature) {
      console.warn("❌ Invalid PayFast Signature. Webhook rejected.");
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    // ✅ If Payment is COMPLETE, activate the subscription
    const subscriptionRef = doc(collection(db, "subscriptions"), userId);

    if (pf_payment_status === "COMPLETE") {
      await setDoc(subscriptionRef, {
        subscriptionId: m_payment_id,
        status: "active",
        createdAt: new Date(),
      });

      console.log("✅ Subscription activated in Firestore for user:", userId);
    } else {
      console.warn("❌ Payment not marked as COMPLETE.");
    }

    return NextResponse.json({ message: "Subscription update successful!" });
  } catch (error) {
    console.error("🔥 Webhook Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ **Verify PayFast ITN Signature**
const verifyPayfastSignature = (data: URLSearchParams, providedSignature: string) => {
  let pfOutput = "";

  // ✅ Sort parameters alphabetically as required by PayFast
  const orderedKeys = [...data.keys()].sort();

  for (let key of orderedKeys) {
    if (key !== "signature") {
      pfOutput += `${key}=${data.get(key)}&`;
    }
  }

  // ✅ Remove the last "&" character
  let signatureString = pfOutput.slice(0, -1);

  // ✅ Append passphrase if required
  if (PAYFAST_PASS_PHRASE) {
    signatureString += `&passphrase=${PAYFAST_PASS_PHRASE.trim()}`;
  }

  console.log("🔹 ITN Signature String (Before Hashing):", signatureString);

  // ✅ Generate the hash and compare it
  const calculatedSignature = crypto.createHash("md5").update(signatureString, "utf8").digest("hex").toUpperCase();
  console.log("🔹 Expected Signature:", calculatedSignature);
  console.log("🔹 Received Signature:", providedSignature);

  return calculatedSignature === providedSignature;
};
