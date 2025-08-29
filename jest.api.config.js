/**
 * Simple Jest configuration for API route tests
 * This mocks complex dependencies to focus on business logic testing
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  testMatch: [
    '<rootDir>/src/app/api/**/__tests__/**/*.{js,ts}',
    '<rootDir>/src/app/lib/**/__tests__/**/*.{js,ts}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '@opennextjs/cloudflare': '<rootDir>/src/__mocks__/@opennextjs/cloudflare.js',
    '@prisma/adapter-d1': '<rootDir>/src/__mocks__/@prisma/adapter-d1.js',
    '^react$': '<rootDir>/src/__mocks__/react.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.api.js'],
  forceExit: true,
};
