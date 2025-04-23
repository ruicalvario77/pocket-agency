import { doc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/app/firebase/firebaseConfig';

describe('Firestore Tests', () => {
  let testUserId: string;

  // Log in before running tests
  beforeAll(async () => {
    const userCredential = await signInWithEmailAndPassword(auth, 'rui@officepoint.co.za', 'Ru1j3ssale77#77');
    testUserId = userCredential.user.uid;
  });

  // Log out after tests are done
  afterAll(async () => {
    await signOut(auth);
  });

  // Helper function to get the user document reference
  const testUserDoc = () => doc(db, 'users', testUserId);

  test('should create and delete a user document', async () => {
    // Create a document
    await setDoc(testUserDoc(), { name: 'Test User', role: 'customer' });

    // Read the document
    const userSnap = await getDoc(testUserDoc());
    expect(userSnap.exists()).toBe(true);
    if (userSnap.exists()) {
      expect(userSnap.data().name).toBe('Test User');
    }

    // Delete the document
    await deleteDoc(testUserDoc());
    const deletedSnap = await getDoc(testUserDoc());
    expect(deletedSnap.exists()).toBe(false);
  }, 10000); // 10-second timeout

  test('should deny access to Firestore without authentication', async () => {
    await signOut(auth); // Ensure no user is logged in
    const testDoc = doc(db, 'users', 'someUserId');
    try {
      await getDoc(testDoc);
      throw new Error('Should have failed');
    } catch (error: any) {
      expect(error.code).toBe('permission-denied');
    }
  }, 10000);

  test('should update a user document', async () => {
    // Log in again for this test
    const userCredential = await signInWithEmailAndPassword(auth, 'rui@officepoint.co.za', 'Ru1j3ssale77#77');
    testUserId = userCredential.user.uid;

    // Create initial document
    await setDoc(testUserDoc(), { name: 'Test User', role: 'customer' });

    // Update the document
    await updateDoc(testUserDoc(), { name: 'Updated User' });

    // Verify the update
    const userSnap = await getDoc(testUserDoc());
    expect(userSnap.data()?.name).toBe('Updated User');

    // Clean up
    await deleteDoc(testUserDoc());
  }, 10000);
});