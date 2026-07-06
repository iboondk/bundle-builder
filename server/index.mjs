// Small backend for the Bundle Builder (take-home bonus).
//
// - GET /api/catalog  → serves the product catalog JSON.
// - In production it also serves the built client from ../dist, so
//   `npm run build && npm start` runs the whole app from one Node process.
//
// In dev, Vite (port 5173) proxies /api here (see vite.config.ts), so the
// front end fetches `/api/catalog` and this server responds.

import express from 'express';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const isProd = process.env.NODE_ENV === 'production';

// The catalog is the single source of truth, read from the same JSON the client bundles.
const catalogPath = fileURLToPath(new URL('../src/data/catalog.json', import.meta.url));
const distPath = fileURLToPath(new URL('../dist', import.meta.url));

const app = express();

app.get('/api/catalog', (_req, res) => {
  try {
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));
    res.json(catalog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load catalog', detail: String(err) });
  }
});

// In production, serve the built SPA (static assets + index.html fallback).
if (isProd) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(fileURLToPath(new URL('../dist/index.html', import.meta.url))));
}

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}  (GET /api/catalog)`);
});
