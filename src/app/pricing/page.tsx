// src/app/pricing/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const PricingPage = () => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<[string, string][] | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, fetch their role
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          console.log("User document not found, redirecting to /auth/login");
          router.push("/auth/login");
          return;
        }

        const role = userDoc.data()?.role;
        setUserRole(role);

        // Redirect non-customers to their appropriate dashboards
        if (role !== "customer") {
          if (role === "superadmin") {
            router.push("/superadmin");
          } else if (role === "admin") {
            router.push("/admin");
          } else if (role === "contractor") {
            router.push("/dashboard");
          }
          return;
        }

        // Pre-fill email for logged-in users
        setEmail(user.email || "");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubscribe = async (plan: "basic" | "pro") => {
    if (!email) {
      alert("Please enter an email address to subscribe.");
      return;
    }

    if (!auth.currentUser && (!fullName || !password)) {
      alert("Please enter your full name and password to subscribe.");
      return;
    }

    setLoading(true);
    let user = auth.currentUser;
    let idToken: string | null = null;

    try {
      if (!user) {
        // Create a new user if not logged in
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          email,
          fullName,
          role: "customer",
          onboardingCompleted: false,
        });

        // Send verification email
        await fetch("/api/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, userId: user.uid }),
        });

        // Create a pending subscription
        const subscriptionRef = doc(db, "subscriptions", user.uid);
        await setDoc(subscriptionRef, {
          userId: user.uid,
          email_address: email,
          plan,
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      }

      idToken = await user!.getIdToken();

      const response = await fetch("/api/payfast-subscribe", {
        method: "POST",
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan, email: email || user?.email }),
      });
      console.log("Fetch response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate subscription");
      }

      const { paymentData, signature } = await response.json();
      console.log("Payment data received:", paymentData, "Signature:", signature);
      setPaymentData(paymentData);
      setSignature(signature);
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Subscription error:", error);
      alert(errorMessage || "An error occurred while initiating your subscription.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentData && signature && formRef.current) {
      console.log("Submitting PayFast form with data:", paymentData, "Signature:", signature);
      formRef.current.submit();
    }
  }, [paymentData, signature]);

  if (authLoading) return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  if (userRole && userRole !== "customer") return null; // Prevent rendering until redirect occurs

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-bold text-blue-600 text-center mb-8">Choose Your Plan</h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Affordable subscriptions for top-tier design and development services.
        </p>

        <div className="text-center mb-8">
          {!auth.currentUser && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border p-2 rounded w-64 mb-2"
                required
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-64 mb-2"
                required
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded w-64 mb-2"
                required
                disabled={loading}
              />
            </>
          )}
          {auth.currentUser && (
            <p className="text-sm text-gray-600 mt-2">Using {auth.currentUser.email}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Basic Plan</h2>
            <p className="text-3xl font-bold text-gray-800 mb-2">R3000</p>
            <p className="text-gray-600 mb-6">per month</p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>✓ Custom Website Design</li>
              <li>✓ Basic Support</li>
              <li>✓ 1 Project Slot</li>
            </ul>
            <button
              onClick={() => handleSubscribe("basic")}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Processing..." : "Confirm Plan"}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Pro Plan</h2>
            <p className="text-3xl font-bold text-gray-800 mb-2">R8000</p>
            <p className="text-gray-600 mb-6">per month</p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>✓ Advanced Website Design</li>
              <li>✓ Web Development</li>
              <li>✓ Priority Support</li>
              <li>✓ 3 Project Slots</li>
            </ul>
            <button
              onClick={() => handleSubscribe("pro")}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Processing..." : "Confirm Plan"}
            </button>
          </div>
        </div>
      </section>

      {paymentData && signature && (
        <form
          ref={formRef}
          action="https://sandbox.payfast.co.za/eng/process"
          method="POST"
          className="hidden"
        >
          {paymentData.map(([key, value], index) => (
            <input key={`${key}-${index}`} type="hidden" name={key} value={value} />
          ))}
          <input type="hidden" name="signature" value={signature} />
        </form>
      )}
    </div>
  );
};

export default PricingPage;