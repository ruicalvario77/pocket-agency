// jest.setup.js
require('dotenv').config({ path: '.env.local' });
console.log('jest.setup.js executed, API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);