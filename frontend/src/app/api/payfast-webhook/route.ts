import { NextResponse } from "next/server";
import { db } from "../../firebase/firebaseConfig";
import { doc, setDoc, collection } from "firebase/firestore";

export async function POST(req: Request) {
  console.log("🚀 PayFast Webhook Received!");

  try {
    const data = await req.formData();
    console.log("✅ Webhook Data:", Object.fromEntries(data.entries()));

    const m_payment_id = data.get("m_payment_id");
    const pf_payment_status = data.get("payment_status");
    const userId = data.get("custom_str1")?.toString();

    console.log("📝 Extracted Data:");
    console.log("➡️ m_payment_id:", m_payment_id);
    console.log("➡️ pf_payment_status:", pf_payment_status);
    console.log("➡️ userId:", userId || "❌ MISSING USER ID");

    if (!userId) {
      console.warn("❌ No user ID found in webhook.");
      return NextResponse.json({ message: "Missing user ID" }, { status: 400 });
    }

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
