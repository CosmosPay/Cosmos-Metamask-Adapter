import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  clearMocks: true,
  transform: {
    '^.+\.ts$': [
      '@swc/jest',
      { jsc: { parser: { syntax: 'typescript' }, target: 'es2022' }, module: { type: 'commonjs' } },
    ],
  },
  // Same alias as tsconfig.json `paths`.
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};

export default config;
