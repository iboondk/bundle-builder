// Vercel serverless function — serves the catalog on the deployed demo.
//
// Locally the Express server (server/index.mjs) handles GET /api/catalog; on
// Vercel there is no long-running server, so this function serves the same
// catalog.json at the same path. The client's loadCatalog() calls /api/catalog
// either way (and still falls back to the bundled JSON if neither is present).
//
// The JSON is imported statically so Vercel's bundler inlines it into the function.
import catalog from '../src/data/catalog.json';

export default function handler(_req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).json(catalog);
}
