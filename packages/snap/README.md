<p align="center">
  <img src="https://raw.githubusercontent.com/CosmosPay/Cosmos-Metamask-Adapter/HEAD/docs/images/banner.png" alt="Stellar Snap: tu cuenta Stellar, dentro de MetaMask" width="100%">
</p>

# Stellar Snap

**Cuentas, pagos, canjes y firmas de Stellar y Soroban dentro de MetaMask.** Un Snap de MetaMask de
código abierto con su propia pantalla en la extensión: menú ⋮ → **Snaps** → **Stellar Snap**.

<p align="center">
  <img src="https://raw.githubusercontent.com/CosmosPay/Cosmos-Metamask-Adapter/HEAD/docs/images/snap.png" alt="Pantalla de inicio del Stellar Snap en MetaMask" width="340">
</p>

- **Cuentas Stellar** derivadas de tu frase secreta de MetaMask (SEP-0005), o importadas.
- **Enviar y recibir** XLM y otros activos, con revisión de comisión y memo, y QR para recibir.
- **Activos y trustlines** del registro de Cosmos Pay o por código y emisor.
- **Canjes** en el DEX de Stellar con cotizaciones de Cosmos Pay, verificados antes de firmar.
- **Soroban**: autorizaciones de contratos con contrato, función y argumentos decodificados.
- **Mensajes** firmados con SEP-53 y **vínculo** verificable entre tu dirección `0x` y tu cuenta Stellar.
- **Mainnet, testnet y futurenet**, con XLM gratis de Friendbot en las redes de prueba.

## Instalar

Desde el sitio de Stellar Snap (botón **Instalar en MetaMask**) o desde tu dApp:

```ts
await ethereum.request({
  method: 'wallet_requestSnaps',
  params: { 'npm:@cosmosapp/stellar-snap': {} },
});
```

Para conectar una dApp, usa el adaptador SEP-43
[`@cosmosapp/stellar-metamask-adapter`](https://www.npmjs.com/package/@cosmosapp/stellar-metamask-adapter).
La API JSON-RPC completa (`stellar_*`) está en la
[documentación de integración](https://github.com/CosmosPay/Cosmos-Metamask-Adapter/blob/HEAD/docs/integracion.md).

> Stellar Snap es un producto independiente de Cosmos Pay y Cosmos: no está afiliado, patrocinado
> ni aprobado por MetaMask, Consensys ni la Stellar Development Foundation.

## Licencia

MIT © Cosmos Pay · [Repositorio](https://github.com/CosmosPay/Cosmos-Metamask-Adapter)
