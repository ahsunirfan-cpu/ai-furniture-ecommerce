import { writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { PRODUCT_SEEDS } from "../src/lib/seed-data";

mkdirSync("data", { recursive: true });

const products = PRODUCT_SEEDS.map((p) => ({
  id: createHash("sha256")
    .update(`roomcraft:${p.slug}`)
    .digest("hex")
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5"),
  name: p.name,
  slug: p.slug,
  description: p.description,
  price_cents: p.priceCents,
  category: p.category,
  colors: p.colors,
  dimensions: { widthCm: p.widthCm, depthCm: p.depthCm, heightCm: p.heightCm },
  material: p.material,
  style_tags: p.styleTags,
  images: p.images,
  stock: p.stock,
  popularity: p.popularity,
  created_at: new Date().toISOString(),
}));

writeFileSync("data/products.json", JSON.stringify(products, null, 2));
console.log(`Wrote ${products.length} products to data/products.json`);