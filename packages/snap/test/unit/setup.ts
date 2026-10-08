/**
 * Unit tests run outside MetaMask: `snap.request` throws unless a test stubs
 * it, so nothing reaches a real snap API by accident.
 */
Object.assign(globalThis, {
  snap: {
    request: async ({ method }: { method: string }) => {
      throw new Error(`snap.request(${method}) is not available in unit tests; stub it or inject a fake.`);
    },
  },
});
