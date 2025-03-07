// src/app/api/payfast-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/admin";
import { sendAssociationEmail } from "@/app/utils/email";

export async function POST(req: NextRequest) {
  try {
    const data = await req.text();
    const parsedData = Object.fromEntries(new URLSearchParams(data));
    const subscriptionId = parsedData.custom_str1;
    const paymentStatus = parsedData.payment_status;

    if (!subscriptionId) throw new Error("Missing subscription ID");

    if (paymentStatus === "COMPLETE") {
      const subscriptionDoc = db.collection("subscriptions").doc(subscriptionId);
      const subscription = (await subscriptionDoc.get()).data();

      await subscriptionDoc.update({
        status: "active",
        payfastSubscriptionId: parsedData.m_payment_id || subscriptionId,
        updatedAt: new Date().toISOString(),
      });

      if (!subscription?.userId) {
        const associationToken = require("crypto").randomBytes(16).toString("hex");
        await subscriptionDoc.update({
          associationToken,
          tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        });

        const email = parsedData.buyer_email || "user@example.com"; // Adjust based on PayFast data
        const associationLink = `https://yourwebsite.com/associate-account?token=${associationToken}`;
        await sendAssociationEmail(email, associationLink);
      }
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}