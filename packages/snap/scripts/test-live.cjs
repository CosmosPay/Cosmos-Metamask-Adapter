// Runs the end-to-end tests against the public Stellar testnet.
const { spawnSync } = require('node:child_process');

const { status } = spawnSync(
  process.execPath,
  [
    '--experimental-vm-modules',
    '--no-warnings=ExperimentalWarning',
    require.resolve('jest/bin/jest'),
    '--testNamePattern',
    'STELLAR_LIVE=1',
  ],
  { stdio: 'inherit', env: { ...process.env, STELLAR_LIVE: '1' } },
);
process.exit(status ?? 1);
