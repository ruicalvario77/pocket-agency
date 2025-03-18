import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/admin";
import { getAuth } from "firebase-admin/auth";
import { PLANS, PlanType } from "../../config/plans";

export async function POST(req: NextRequest) {
  const { newPlan } = await req.json();
  if (!Object.keys(PLANS).includes(newPlan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const auth = getAuth();
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedToken = await auth.verifyIdToken(token);
  const userId = decodedToken.uid;

  const subscriptionRef = db.collection("subscriptions").doc(userId);
  const subscription = await subscriptionRef.get();
  if (!subscription.exists) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  const currentData = subscription.data()!;
  const currentPlan = currentData.plan || "basic";
  const currentPrice = PLANS[currentPlan as PlanType].price;
  const newPrice = PLANS[newPlan as PlanType].price;
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - today.getDate() + 1;

  let updateData: any = { plan: newPlan, updatedAt: today.toISOString() };
  if (newPrice > currentPrice) {
    // Upgrade: Prorate the difference
    const proratedCharge = ((newPrice - currentPrice) * daysRemaining) / daysInMonth;
    updateData.proratedCharge = proratedCharge;
    // TODO: Call PayFast API to charge prorated amount and update plan
    console.log(`Charging ${proratedCharge} for upgrade to ${newPlan}`);
  } else if (newPrice < currentPrice) {
    // Downgrade: Effective next billing cycle
    const nextBillingDate = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString();
    updateData.effectiveDate = nextBillingDate;
    // TODO: Call PayFast API to schedule downgrade
    console.log(`Downgrade to ${newPlan} effective ${nextBillingDate}`);
  }

  await subscriptionRef.update(updateData);
  return NextResponse.json({ message: "Plan updated", plan: newPlan });
}