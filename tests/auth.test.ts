import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/app/firebase/firebaseConfig';

describe('Authentication Tests', () => {
  test('should log in a user with valid credentials', async () => {
    const email = 'rui@pocket-agency.co.za';
    const password = 'Ru1j3ssale77#77';
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    expect(userCredential.user).not.toBeNull();
    expect(userCredential.user.uid).toBe('test-uid-2');
  });

  test('should log out a user', async () => {
    await signInWithEmailAndPassword(auth, 'rui@pocket-agency.co.za', 'Ru1j3ssale77#77'); // Log in first
    await signOut(auth);
    expect(auth.currentUser).toBeNull();
  });

  test('should fail to log in with invalid credentials', async () => {
    try {
      await signInWithEmailAndPassword(auth, 'wrong@example.com', 'wrongpassword');
      throw new Error('Should have failed');
    } catch (error: any) {
      expect(error.code).toBe('auth/invalid-credential');
    }
  });
});