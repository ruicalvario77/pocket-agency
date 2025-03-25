// src/app/firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC7SlX_6Svqyr5niMcfCH4OaaZ0uTSxQ1U",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "pocket-agency-auth.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pocket-agency-auth",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "pocket-agency-auth.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "358439219070",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:358439219070:web:515eed3a57c704f27e4d2f",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-RZW27NK4XZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Authentication and Firestore with types
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);