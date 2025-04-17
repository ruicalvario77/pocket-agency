require('dotenv').config({ path: '.env.test' });

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',  // Maps '@/...' to 'src/...'
    },
  };