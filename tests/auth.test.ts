import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/app/firebase/firebaseConfig';

describe('Authentication Tests', () => {
  test('should log in a user with valid credentials', async () => {
    const email = 'rui@pocket-agency.co.za'; // Replace with a test user’s email
    const password = 'Ru1j3ssale77#77';   // Replace with the test user’s password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    expect(userCredential.user).not.toBeNull();
  });

  test('should log out a user', async () => {
    await signOut(auth);
    expect(auth.currentUser).toBeNull();
  });

  test('should fail to log in with invalid credentials', async () => {
    try {
      await signInWithEmailAndPassword(auth, 'wrong@example.com', 'wrongpassword');
    } catch (error: any) {
      expect(error.code).toBe('auth/user-not-found');
    }
  });

  test('should send a password reset email', async () => {
    const email = 'rui@pocket-agency.co.za';
    await sendPasswordResetEmail(auth, email);
    // Note: You can't directly test if the email was sent, but you can check if the function runs without errors.
    expect(true).toBe(true); // Placeholder assertion
  });
});