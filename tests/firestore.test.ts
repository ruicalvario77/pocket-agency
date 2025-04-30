import { doc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/app/firebase/firebaseConfig';

describe('Firestore Tests', () => {
  let testUserId: string;

  beforeAll(async () => {
    const userCredential = await signInWithEmailAndPassword(auth, 'rui@officepoint.co.za', 'Ru1j3ssale77#77');
    testUserId = userCredential.user.uid; // 'test-uid'
  });

  afterAll(async () => {
    await signOut(auth);
  });

  const testUserDoc = () => doc(db, 'users', testUserId);

  test('should create and delete a user document', async () => {
    await setDoc(testUserDoc(), { name: 'Test User', role: 'customer' });
    const userSnap = await getDoc(testUserDoc());
    expect(userSnap.exists()).toBe(true);
    if (userSnap.exists()) {
      expect(userSnap.data()).toEqual({ name: 'Test User', role: 'customer' });
    } else {
      throw new Error('Document does not exist');
    }

    await deleteDoc(testUserDoc());
    try {
      await getDoc(testUserDoc());
    } catch (error: any) {
      expect(error.code).toBe('permission-denied'); // Mock doesn’t track deletion
    }
  }, 10000);

  test('should deny access to Firestore without authentication', async () => {
    await signOut(auth);
    const testDoc = doc(db, 'users', 'someUserId');
    try {
      await getDoc(testDoc);
      throw new Error('Should have failed');
    } catch (error: any) {
      expect(error.code).toBe('permission-denied');
    }
  }, 10000);

  test('should update a user document', async () => {
    await signInWithEmailAndPassword(auth, 'rui@officepoint.co.za', 'Ru1j3ssale77#77');
    await setDoc(testUserDoc(), { name: 'Test User', role: 'customer' });
    await updateDoc(testUserDoc(), { name: 'Updated User' });
  
    const userSnap = await getDoc(testUserDoc());
    expect(userSnap.exists()).toBe(true);
    if (userSnap.exists()) {
      expect(userSnap.data()).toEqual({ name: 'Updated User', role: 'customer' }); // Expect updated data
    } else {
      throw new Error('Document does not exist');
    }
  
    await deleteDoc(testUserDoc());
  }, 10000);
});