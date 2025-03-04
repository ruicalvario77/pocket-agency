import admin from "firebase-admin";

// Parse environment variable
const serviceAccount = process.env.FIREBASE_ADMIN_SDK
  ? JSON.parse(process.env.FIREBASE_ADMIN_SDK)
  : null;

// Fix private key formatting
if (serviceAccount && serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

if (!serviceAccount) {
  console.error("❌ Firebase Admin SDK credentials are missing!");
  throw new Error("Missing Firebase Admin SDK credentials.");
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const authAdmin = admin.auth();
