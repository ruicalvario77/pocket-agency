import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
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
});