import type { Config } from 'jest';

/** TS/TSX through SWC (TypeScript 7 has no JS API for ts-jest), with the snap's JSX runtime. */
const transform: Config['transform'] = {
  '^.+\.(t|j)sx?$': [
    '@swc/jest',
    {
      jsc: {
        parser: { syntax: 'typescript', tsx: true },
        transform: { react: { runtime: 'automatic', importSource: '@metamask/snaps-sdk' } },
        target: 'es2022',
      },
      module: { type: 'commonjs' },
    },
  ],
};

/** Same aliases as tsconfig.json `paths`. */
const moduleNameMapper: Config['moduleNameMapper'] = {
  '^@/(.*)$': '<rootDir>/src/$1',
  '^@locales/(.*)$': '<rootDir>/locales/$1',
  '^@test/(.*)$': '<rootDir>/test/$1',
};

const config: Config = {
  // Global option: the snaps-jest preset's 30 s is lost inside `projects`.
  testTimeout: 30_000,
  projects: [
    {
      // Pure modules, with their dependencies injected: fast, no MetaMask.
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/test/unit/**/*.test.ts?(x)'],
      setupFiles: ['<rootDir>/test/unit/setup.ts'],
      clearMocks: true,
      transform,
      moduleNameMapper,
    },
    {
      // The built bundle in a simulated MetaMask (`npm run build` first).
      displayName: 'integration',
      preset: '@metamask/snaps-jest',
      testMatch: ['<rootDir>/test/integration/**/*.test.ts'],
      transform,
      moduleNameMapper,
    },
  ],
};

export default config;
