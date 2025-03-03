import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC7SlX_6Svqyr5niMcfCH4OaaZ0uTSxQ1U",
    authDomain: "pocket-agency-auth.firebaseapp.com",
    projectId: "pocket-agency-auth",
    storageBucket: "pocket-agency-auth.firebasestorage.app",
    messagingSenderId: "358439219070",
    appId: "1:358439219070:web:515eed3a57c704f27e4d2f",
    measurementId: "G-RZW27NK4XZ"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and export it
export const auth = getAuth(app);
