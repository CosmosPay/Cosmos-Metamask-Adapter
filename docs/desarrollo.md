# Desarrollo y publicación

Requisitos: Node 22.18+ y **MetaMask Flask** para cargar el Snap local. Arquitectura,
convenciones y puntos de extensión: [`CLAUDE.md`](../CLAUDE.md).

## Comandos

```bash
npm install
npm start                # Snap en :8080 (watch) + sitio en :5173
npm test                 # Snap (unit + integración, compila antes) + adaptador
npm run typecheck        # TypeScript en los tres paquetes
npm run format           # Prettier (.prettierrc.json)
npm run test:unit -w packages/snap          # solo unitarios (rápidos, sin MetaMask)
npm run test:live -w packages/snap          # E2E real en testnet: Friendbot, pago y canje
npm run sync:registry -w packages/snap      # refresca la copia incluida del registro de activos
npm run build                               # Snap, adaptador y sitio
npm run indexnow -w packages/site           # avisa a los buscadores IndexNow tras un despliegue
```

## Variables de entorno

Cada paquete lee su propio `.env` (Git lo ignora). Copia el ejemplo y completa lo que necesites;
todas son opcionales.

```bash
cp packages/site/.env.example packages/site/.env
cp packages/snap/.env.example packages/snap/.env
```

### Sitio (`packages/site/.env`)

Las variables `VITE_` terminan en el sitio público: nunca pongas un secreto en ellas.

| Variable | Para qué |
| --- | --- |
| `VITE_SITE_URL` | Dominio público (URL canónicas, `hreflang`, sitemap, tarjetas sociales). En Vercel, Netlify, Cloudflare Pages y Render se detecta solo; el build avisa si falta. |
| `VITE_SNAP_ID` | Snap que instala el botón. Por defecto, el Snap local en desarrollo y `npm:@cosmosapp/stellar-snap` en un build. |
| `VITE_DONATION_ADDRESS` | Cuenta de Stellar (`G…`, red pública) que recibe donaciones: activa la sección «Donaciones» con su QR. |
| `VITE_DONATION_URL` | Página con otras formas de donar (GitHub Sponsors, Open Collective…). |
| `VITE_GA_MEASUREMENT_ID` | ID de Google Analytics 4 (`G-…`). Solo se carga si el visitante acepta el aviso; mide páginas vistas y Core Web Vitals, y la política de privacidad lo describe. |
| `VITE_GOOGLE_SITE_VERIFICATION` | Verificación de Google Search Console. |
| `VITE_BING_SITE_VERIFICATION` | Verificación de Bing Webmaster Tools. |
| `VITE_YANDEX_VERIFICATION` | Verificación de Yandex Webmaster. |
| `VITE_BAIDU_SITE_VERIFICATION` | Verificación de Baidu. |
| `VITE_NAVER_SITE_VERIFICATION` | Verificación de Naver. |
| `VITE_SEZNAM_VERIFICATION` | Verificación de Seznam. |
| `INDEXNOW_KEY` | Clave IndexNow (8 a 128 letras, números o guiones). El build publica `/<clave>.txt` y `npm run indexnow -w packages/site` anuncia todas las páginas a Bing, Yandex, Naver y Seznam. |

### Snap (`packages/snap/.env`)

| Variable | Para qué |
| --- | --- |
| `COSMOS_API_KEY_TESTNET` | Clave `dev` de la API de Cosmos Pay (solo testnet). |
| `COSMOS_API_KEY_MAINNET` | Clave `prod` de la API de Cosmos Pay (solo mainnet). |

Sin ellas, el Snap usa la clave pública compartida que obtiene en ejecución. Quedan dentro del
código del Snap, que cualquiera puede leer: usa claves pensadas para ser públicas.

## Publicación

1. **npm.** Publica `packages/snap` (`@cosmosapp/stellar-snap`) y `packages/adapter`
   (`@cosmosapp/stellar-metamask-adapter`) con `npm publish -w <paquete>`. Ya tienen
   `publishConfig.access: public`, que los paquetes con scope necesitan.
2. **MetaMask.** El Snap necesita **auditoría y allowlist** de MetaMask para instalarse en la
   versión estable (usa `snap_getBip32Entropy`): https://docs.metamask.io/snaps/how-to/get-allowlisted/.
   Mientras tanto se instala en MetaMask Flask.
3. **SDK.** `platformVersion` está fijado a `12.0.1` (la máxima de MetaMask estable); no subas
   `@metamask/snaps-sdk` sin comprobarlo.
4. **Sitio.** `npm run build -w packages/site` genera HTML estático: una página por ruta e idioma
   (español en `/`, el resto en `/en/`, `/pt/`, `/fr/`, `/de/`, `/zh/`, `/hi/`), más `404.html`,
   `sitemap.xml`, `robots.txt`, `llms.txt` y `llms-full.txt`. Sirve `packages/site/dist` en
   cualquier hosting estático, que debe responder `404.html` para las rutas desconocidas.
5. **Buscadores.** Verifica el dominio en Google Search Console y Bing Webmaster Tools (con las
   variables de arriba), envía `https://tu-dominio/sitemap.xml` y, si usas IndexNow, ejecuta
   `npm run indexnow -w packages/site` después de cada despliegue.
