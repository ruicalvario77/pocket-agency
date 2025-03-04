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

    console.log("📝 Extracted Data:");
    console.log("➡️ m_payment_id:", m_payment_id);
    console.log("➡️ pf_payment_status:", pf_payment_status);

    if (pf_payment_status === "COMPLETE") {
      const docRef = doc(collection(db, "subscriptions"), m_payment_id as string);
      
      await setDoc(docRef, {
        subscriptionId: m_payment_id,
        status: "active",
        createdAt: new Date(),
      });

      console.log("✅ Subscription saved to Firestore!");
      return NextResponse.json({ message: "Subscription successful!" });
    }

    console.log("❌ Payment not completed.");
    return NextResponse.json({ message: "Payment not completed." });
  } catch (error) {
    console.error("🔥 Webhook Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
