import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Product, ProductCategory } from "@/lib/types";
import type { ProductQuery } from "@/lib/products/queries";

let cache: Product[] | undefined;

export async function loadDemoProducts(): Promise<Product[]> {
  if (cache) return cache;
  const file = path.join(process.cwd(), "data", "products.json");
  const raw = JSON.parse(await readFile(file, "utf8")) as Product[];
  cache = raw.map((p) => ({
    ...p,
    dimensions: p.dimensions ?? { widthCm: 0, depthCm: 0, heightCm: 0 },
  }));
  return cache;
}

export async function filterDemoProducts(query: ProductQuery): Promise<Product[]> {
  let rows = await loadDemoProducts();
  if (query.q) {
    const q = query.q.toLowerCase();
    rows = rows.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }
  if (query.category) rows = rows.filter((p) => p.category === query.category);
  if (query.minPrice != null) rows = rows.filter((p) => p.price_cents >= query.minPrice!);
  if (query.maxPrice != null) rows = rows.filter((p) => p.price_cents <= query.maxPrice!);
  if (query.color) {
    const c = query.color.toLowerCase();
    rows = rows.filter((p) => p.colors.some((x) => x.toLowerCase().includes(c)));
  }
  if (query.material) {
    const m = query.material.toLowerCase();
    rows = rows.filter((p) => p.material.toLowerCase().includes(m));
  }
  if (query.style) {
    const s = query.style.toLowerCase();
    rows = rows.filter((p) => p.style_tags.some((t) => t.toLowerCase().includes(s)));
  }

  switch (query.sort) {
    case "price_asc":
      rows.sort((a, b) => a.price_cents - b.price_cents);
      break;
    case "price_desc":
      rows.sort((a, b) => b.price_cents - a.price_cents);
      break;
    case "newest":
      rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
      break;
    default:
      rows.sort((a, b) => b.popularity - a.popularity);
  }
  return rows.slice(0, 60);
}

export async function getDemoProductBySlug(slug: string): Promise<Product | null> {
  const products = await loadDemoProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getDemoProductById(id: string): Promise<Product | null> {
  const products = await loadDemoProducts();
  return products.find((p) => p.id === id) ?? null;
}

export async function getDemoProductsByCategory(categories: ProductCategory[]): Promise<Product[]> {
  const products = await loadDemoProducts();
  return products.filter((p) => categories.includes(p.category) && p.stock > 0);
}