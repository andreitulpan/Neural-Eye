module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // Tell Jest how to resolve your aliases from tsconfig.json
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  transformIgnorePatterns: ['/node_modules/'],

  // Important! This makes jest-dom matchers like toBeInTheDocument available in all tests
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
