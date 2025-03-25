// src/app/api/payfast-update-subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/admin";
import { getAuth } from "firebase-admin/auth";
import { PLANS, PlanType } from "../../config/plans";
import nodeCrypto from "crypto";
import { sendEmail } from "@/app/utils/email";

// Define the type for updateData
interface UpdateData {
  plan: PlanType;
  updatedAt: string;
  proratedCharge?: number;
  effectiveDate?: string;
  [key: string]: string | number | boolean | object | null | undefined; // More specific than 'any'
}

export async function POST(req: NextRequest) {
  const { newPlan }: { newPlan: PlanType } = await req.json();
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
  const currentData = subscriptionDoc.data();
  const currentPlan = (currentData.plan || "basic") as PlanType;
  const currentPrice = PLANS[currentPlan].price;
  const newPrice = PLANS[newPlan].price;
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - today.getDate() + 1;

  const passphrase = process.env.PAYFAST_PASSPHRASE || "Ru1j3ssale77-77";
  const updateData: UpdateData = { plan: newPlan, updatedAt: today.toISOString() };

  if (newPrice > currentPrice) {
    // Upgrade: Prorate the difference
    const proratedCharge = ((newPrice - currentPrice) * daysRemaining) / daysInMonth;
    updateData.proratedCharge = proratedCharge;

    const timestamp = today.toISOString().replace(/\.\d{3}Z$/, "+02:00");
    const merchantId = process.env.PAYFAST_MERCHANT_ID || "10037398";

    // Body parameters
    const bodyParams: { [key: string]: string } = {
      "amount": (newPrice * 100).toString(),
      "prorate": "true",
    };

    // Header parameters (excluding signature)
    const headerParams: { [key: string]: string } = {
      "merchant-id": merchantId,
      "timestamp": timestamp,
      "version": "v1",
    };

    // Signature based on body parameters only
    const signatureParams = Object.keys(bodyParams)
      .sort()
      .map(key => `${key}=${bodyParams[key]}`) // Use raw values
      .join("&");
    const signatureString = signatureParams + `&passphrase=${passphrase}`;
    const signature = nodeCrypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex")
      .toLowerCase();

    // Manual log to avoid serialization issues
    const logSignatureString = `${signatureParams}&passphrase=${passphrase}`;
    console.log("Updating PayFast subscription with body params:", bodyParams);
    console.log("Header params:", headerParams);
    console.log("Signature string (logged):", logSignatureString);
    console.log("Generated signature:", signature);
    console.log("Using subscription token:", currentData.payfastToken);

    try {
      const response = await fetch(
        `https://api.payfast.co.za/subscriptions/${currentData.payfastToken}/update?testing=true`,
        {
          method: "PATCH",
          headers: {
            "merchant-id": merchantId,
            "version": "v1",
            "timestamp": timestamp,
            "signature": signature,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(bodyParams).toString(),
        }
      );

      const responseText = await response.text();
      console.log("PayFast API response status:", response.status);
      console.log("PayFast API response text:", responseText);

      if (!response.ok) {
        console.error("Failed to update PayFast subscription:", responseText);
        return NextResponse.json({ error: "Failed to update subscription", details: responseText }, { status: 500 });
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
    } catch (error: unknown) {
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      console.error("Error updating PayFast subscription:", errorMessage);
      return NextResponse.json({ error: "Error updating subscription", details: errorMessage }, { status: 500 });
    }
  } else if (newPrice < currentPrice) {
    // Downgrade: Effective next billing cycle
    const nextBillingDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    updateData.effectiveDate = nextBillingDate.toISOString();

    const timestamp = today.toISOString().replace(/\.\d{3}Z$/, "+02:00");
    const merchantId = process.env.PAYFAST_MERCHANT_ID || "10037398";

    // Body parameters
    const bodyParams: { [key: string]: string } = {
      "amount": (newPrice * 100).toString(),
      "effective_date": nextBillingDate.toISOString().split("T")[0],
    };

    // Header parameters (excluding signature)
    const headerParams: { [key: string]: string } = {
      "merchant-id": merchantId,
      "timestamp": timestamp,
      "version": "v1",
    };

    // Signature based on body parameters only
    const signatureParams = Object.keys(bodyParams)
      .sort()
      .map(key => `${key}=${bodyParams[key]}`) // Use raw values
      .join("&");
    const signatureString = signatureParams + `&passphrase=${passphrase}`;
    const signature = nodeCrypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex")
      .toLowerCase();

    // Manual log to avoid serialization issues
    const logSignatureString = `${signatureParams}&passphrase=${passphrase}`;
    console.log("Updating PayFast subscription with body params:", bodyParams);
    console.log("Header params:", headerParams);
    console.log("Signature string (logged):", logSignatureString);
    console.log("Generated signature:", signature);
    console.log("Using subscription token:", currentData.payfastToken);

    try {
      const response = await fetch(
        `https://api.payfast.co.za/subscriptions/${currentData.payfastToken}/update?testing=true`,
        {
          method: "PATCH",
          headers: {
            "merchant-id": merchantId,
            "version": "v1",
            "timestamp": timestamp,
            "signature": signature,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(bodyParams).toString(),
        }
      );

      const responseText = await response.text();
      console.log("PayFast API response status:", response.status);
      console.log("PayFast API response text:", responseText);

      if (!response.ok) {
        console.error("Failed to update PayFast subscription:", responseText);
        return NextResponse.json({ error: "Failed to update subscription", details: responseText }, { status: 500 });
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
    } catch (error: unknown) {
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      console.error("Error updating PayFast subscription:", errorMessage);
      return NextResponse.json({ error: "Error updating subscription", details: errorMessage }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "No plan change required" }, { status: 400 });
  }

  return NextResponse.json({ message: "Plan updated", plan: newPlan });
}