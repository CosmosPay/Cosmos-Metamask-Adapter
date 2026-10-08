/**
 * Runs the end-to-end tests against the public Stellar testnet (real
 * Friendbot, Horizon and Cosmos Pay calls): `npm run test:live -w packages/snap`.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { status } = spawnSync(
  process.execPath,
  [
    '--experimental-vm-modules',
    '--no-warnings=ExperimentalWarning',
    require.resolve('jest/bin/jest'),
    '--selectProjects',
    'integration',
    '--testNamePattern',
    'STELLAR_LIVE=1',
  ],
  { stdio: 'inherit', env: { ...process.env, STELLAR_LIVE: '1' } },
);
process.exit(status ?? 1);
