/**
 * Snap entry point: MetaMask calls these exports.
 *
 * - `onRpcRequest`: the `stellar_*` JSON-RPC API for dApps (see `rpc/`).
 * - `onHomePage` / `onUserInput`: the wallet UI inside MetaMask (see `home/`).
 */
export { onRpcRequest } from '@/rpc';
export { onHomePage, onUserInput } from '@/home';
