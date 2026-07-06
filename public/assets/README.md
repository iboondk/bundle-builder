# Assets (exported from Figma by the Tech Lead)

`products/` — one PNG per product, filename === `catalog.json` `image` field.
Exported at 2×–4× from the duplicated Figma file. Served by Vite from `/assets/products/<file>`.

| catalog id | file | px |
|---|---|---|
| wyze-cam-v4 | products/wyze-cam-v4.png | 202×274 |
| wyze-cam-pan-v3 | products/wyze-cam-pan-v3.png | 202×274 |
| wyze-cam-floodlight-v2 | products/wyze-cam-floodlight-v2.png | 200×302 |
| wyze-duo-cam-doorbell | products/wyze-duo-cam-doorbell.png | 202×202 |
| wyze-battery-cam-pro | products/wyze-battery-cam-pro.png | 202×202 |
| cam-unlimited | products/cam-unlimited.png | 104×124 |
| wyze-sense-motion | products/wyze-sense-motion.png | 164×164 |
| wyze-sense-hub | products/wyze-sense-hub.png | 164×160 |
| wyze-microsd-256 | products/wyze-microsd-256.png | 164×164 |
| fast-shipping | products/fast-shipping.png | 116×116 |

## Variant swatches (`swatches/`)
The Figma variant chips are small crops of the same product photo — there are **no distinct
per-color source images** in the file. **Decision:** the `swatchImage` in `catalog.json` may point
at the product image as a fallback, OR DeepSeek renders the chip using the product image scaled
into the 28px swatch. Do **not** block on per-color swatch art; document this in the app README.
(Recall: the brief explicitly de-prioritized variant-chip styling — behavior first.)

## Data-access note
`catalog.json` stores bare filenames. `data/dataAccess.ts` (or the image resolver) prefixes
`/assets/products/`. Keep the mapping in one place so a real CDN/API can swap it later.
