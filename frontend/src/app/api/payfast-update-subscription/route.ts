// src/app/api/payfast-update-subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/admin";
import { getAuth } from "firebase-admin/auth";
import { PLANS, PlanType } from "../../config/plans";
const nodeCrypto = require("crypto") as typeof import("crypto");
import { sendEmail } from "@/app/utils/email";

export async function POST(req: NextRequest) {
  const { newPlan }: { newPlan: PlanType } = await req.json(); // Explicitly type newPlan
  if (!Object.keys(PLANS).includes(newPlan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

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
  const subscriptionId = subscriptionDoc.id;
  const currentData = subscriptionDoc.data();
  const currentPlan = (currentData.plan || "basic") as PlanType; // Ensure type safety
  const currentPrice = PLANS[currentPlan].price;
  const newPrice = PLANS[newPlan].price;
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - today.getDate() + 1;

  const passphrase = process.env.PAYFAST_PASSPHRASE || "Ru1j3ssale77-77";
  let updateData: any = { plan: newPlan, updatedAt: today.toISOString() };

  if (newPrice > currentPrice) {
    // Upgrade: Prorate the difference
    const proratedCharge = ((newPrice - currentPrice) * daysRemaining) / daysInMonth;
    updateData.proratedCharge = proratedCharge;

    const timestamp = today.toISOString();
    const params: { [key: string]: string } = {
      "merchant-id": process.env.PAYFAST_MERCHANT_ID || "10037398",
      "version": "v1",
      "timestamp": timestamp,
      "amount": (newPrice * 100).toString(), // PayFast uses cents
      "prorate": "true",
    };
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    const signatureString = sortedParams + `&passphrase=${passphrase}`;
    const signature = nodeCrypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex")
      .toLowerCase();

    try {
      const response = await fetch(`https://api.payfast.co.za/subscriptions/${currentData.payfastToken}/update`, {
        method: "PUT",
        headers: {
          "merchant-id": process.env.PAYFAST_MERCHANT_ID || "10037398",
          "version": "v1",
          "timestamp": timestamp,
          "signature": signature,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(params).toString(),
      });

      const responseText = await response.text();
      if (!response.ok) {
        console.error("Failed to update PayFast subscription:", responseText);
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
      }
      console.log("PayFast subscription updated for upgrade:", responseText);

      await subscriptionDoc.ref.update(updateData);
      await sendEmail(
        currentData.email_address,
        "Subscription Plan Upgraded",
        `Dear Customer,
        Your subscription has been upgraded to the ${PLANS[newPlan].name} plan.
        A prorated charge of R${proratedCharge.toFixed(2)} has been applied for the remaining ${daysRemaining} days of this billing cycle.
        Starting next month, you will be billed R${newPrice}/month.`
      );
    } catch (error) {
      console.error("Error updating PayFast subscription:", error);
      return NextResponse.json({ error: "Error updating subscription" }, { status: 500 });
    }
  } else if (newPrice < currentPrice) {
    // Downgrade: Effective next billing cycle
    const nextBillingDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    updateData.effectiveDate = nextBillingDate.toISOString();

    const timestamp = today.toISOString();
    const params: { [key: string]: string } = {
      "merchant-id": process.env.PAYFAST_MERCHANT_ID || "10037398",
      "version": "v1",
      "timestamp": timestamp,
      "amount": (newPrice * 100).toString(),
      "effective_date": nextBillingDate.toISOString().split("T")[0], // Format: YYYY-MM-DD
    };
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    const signatureString = sortedParams + `&passphrase=${passphrase}`;
    const signature = nodeCrypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex")
      .toLowerCase();

    try {
      const response = await fetch(`https://api.payfast.co.za/subscriptions/${currentData.payfastToken}/update`, {
        method: "PUT",
        headers: {
          "merchant-id": process.env.PAYFAST_MERCHANT_ID || "10037398",
          "version": "v1",
          "timestamp": timestamp,
          "signature": signature,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(params).toString(),
      });

      const responseText = await response.text();
      if (!response.ok) {
        console.error("Failed to update PayFast subscription:", responseText);
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
      }
      console.log("PayFast subscription updated for downgrade:", responseText);

      await subscriptionDoc.ref.update(updateData);
      await sendEmail(
        currentData.email_address,
        "Subscription Plan Downgraded",
        `Dear Customer,
        Your subscription will be downgraded to the ${PLANS[newPlan].name} plan effective ${nextBillingDate.toISOString().split("T")[0]}.
        You will continue to enjoy ${PLANS[currentPlan].name} benefits until then.
        Starting next month, you will be billed R${newPrice}/month.`
      );
    } catch (error) {
      console.error("Error updating PayFast subscription:", error);
      return NextResponse.json({ error: "Error updating subscription" }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "No plan change required" }, { status: 400 });
  }

  return NextResponse.json({ message: "Plan updated", plan: newPlan });
}