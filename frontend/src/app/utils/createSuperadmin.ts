// frontend/src/app/utils/createSuperadmin.ts
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export async function createSuperadmin(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "superadmin",
      createdAt: new Date().toISOString(),
    });
    console.log("Superadmin created:", user.uid);
  } catch (error) {
    console.error("Error creating superadmin:", error);
  }
}