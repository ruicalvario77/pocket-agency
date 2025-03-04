import { NextResponse } from "next/server";
import { db } from "../../firebase/firebaseConfig";
import { doc, setDoc, collection } from "firebase/firestore";

export async function POST(req: Request) {
  console.log("🚀 PayFast Webhook Received!");

  try {
    // Read Raw Body
    const rawBody = await req.text();
    console.log("📝 Raw ITN Data:", rawBody);

    // Parse Form Data
    const params = new URLSearchParams(rawBody);
    console.log("✅ Parsed ITN Data:", Object.fromEntries(params.entries()));

    const m_payment_id = params.get("m_payment_id");
    const pf_payment_status = params.get("payment_status");
    const userId = params.get("custom_str1") || "";

    console.log("📝 Extracted Data:");
    console.log("➡️ m_payment_id:", m_payment_id);
    console.log("➡️ pf_payment_status:", pf_payment_status);
    console.log("➡️ userId:", userId);

    if (pf_payment_status === "COMPLETE" && userId) {
      const docRef = doc(collection(db, "subscriptions"), userId);

      await setDoc(docRef, {
        subscriptionId: m_payment_id,
        status: "active",
        createdAt: new Date(),
      });

      console.log("✅ Subscription saved to Firestore!");
      return NextResponse.json({ message: "Subscription successful!" });
    }

    console.log("❌ Payment not completed or missing userId.");
    return NextResponse.json({ message: "Payment not completed or missing userId." });
  } catch (error) {
    console.error("🔥 Webhook Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
