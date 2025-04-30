// jest.setup.js
require('dotenv').config({ path: '.env.local' });
console.log('jest.setup.js executed, API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

// Mock authentication state
let mockUser = null; // Tracks the simulated "current user"

// Mock Firebase Authentication
jest.mock('firebase/auth', () => {
  return {
    signInWithEmailAndPassword: jest.fn((auth, email, password) => {
      if (email === 'rui@officepoint.co.za' && password === 'Ru1j3ssale77#77') {
        mockUser = { uid: 'test-uid' }; // Simulate successful login
        return Promise.resolve({ user: mockUser });
      } else if (email === 'rui@pocket-agency.co.za' && password === 'Ru1j3ssale77#77') {
        mockUser = { uid: 'test-uid-2' }; // Support both test emails
        return Promise.resolve({ user: mockUser });
      }
      return Promise.reject({ code: 'auth/invalid-credential' });
    }),
    signOut: jest.fn(() => {
      mockUser = null; // Simulate logout
      return Promise.resolve();
    }),
    getAuth: jest.fn(() => ({
      currentUser: mockUser, // Return the simulated current user
    })),
  };
});

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => {
    const mockDocRef = { id: 'test-doc-id' }; // Simulated document reference
    let mockData = {}; // In-memory store for documents
  
    return {
      getFirestore: jest.fn(() => ({})),
      doc: jest.fn((db, collection, id) => ({ ...mockDocRef, id })),
      setDoc: jest.fn((docRef, data) => {
        if (mockUser) {
          mockData[docRef.id] = data; // Store the document data
          return Promise.resolve();
        }
        return Promise.reject({ code: 'permission-denied' });
      }),
      getDoc: jest.fn((docRef) => {
        if (!mockUser) {
          return Promise.reject({ code: 'permission-denied' });
        }
        const data = mockData[docRef.id];
        return Promise.resolve({
          exists: () => !!data, // True if data exists, false if deleted
          data: () => data, // Return the stored data or undefined
          id: docRef.id,
        });
      }),
      deleteDoc: jest.fn((docRef) => {
        if (mockUser) {
          delete mockData[docRef.id]; // Remove the document
          return Promise.resolve();
        }
        return Promise.reject({ code: 'permission-denied' });
      }),
      updateDoc: jest.fn((docRef, data) => {
        if (mockUser) {
          mockData[docRef.id] = { ...mockData[docRef.id], ...data }; // Update the document
          return Promise.resolve();
        }
        return Promise.reject({ code: 'permission-denied' });
      }),
    };
  });