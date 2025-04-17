import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/app/firebase/firebaseConfig';

describe('Firestore Tests', () => {
  let testUserId: string;

  // Sign in a test user before all tests
  beforeAll(async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, 'rui@pocket-agency.co.za', 'Ru1j3ssale77#77');
      testUserId = userCredential.user.uid;
    } catch (error) {
      console.error('Authentication error details:', error);
      throw error;
    }
  });

  // Sign out after all tests
  afterAll(async () => {
    await signOut(auth);
  });

  // Helper function to get the document reference using the authenticated user's UID
  const testUserDoc = () => doc(db, 'users', testUserId);

  test('should create a user document', async () => {
    await setDoc(testUserDoc(), { name: 'Test User', role: 'customer' });
    const userSnap = await getDoc(testUserDoc());
    expect(userSnap.exists()).toBe(true);
    if (userSnap.exists()) {
      expect(userSnap.data().name).toBe('Test User');
    }
  }, 10000);

  test('should update a user document', async () => {
    await updateDoc(testUserDoc(), { name: 'Updated User' });
    const userSnap = await getDoc(testUserDoc());
    expect(userSnap.exists()).toBe(true);
    if (userSnap.exists()) {
      expect(userSnap.data().name).toBe('Updated User');
    }
  });

  test('should delete a user document', async () => {
    await deleteDoc(testUserDoc());
    const userSnap = await getDoc(testUserDoc());
    expect(userSnap.exists()).toBe(false);
  });

  test('should deny non-admin access to admin-only collection', async () => {
    const adminDataDoc = doc(db, 'adminData', 'someDoc');
    try {
      await getDoc(adminDataDoc);
    } catch (error: any) {
      expect(error.code).toBe('permission-denied');
    }
  });
});