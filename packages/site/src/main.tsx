import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from '@/App';
import { locate } from '@/lib/router';
import '@/styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

/**
 * Every page is prerendered (scripts/prerender.mts), and `data-path` says for
 * which path. Hydrate when it's this page; render from scratch in the dev
 * server's empty shell, or when a host serves 404.html for a path in another
 * language.
 */
const prerendered = root.dataset.path === undefined ? null : locate(root.dataset.path);
const here = locate(window.location.pathname);

if (prerendered && prerendered.route === here.route && prerendered.language === here.language) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
