import "server-only";

import { sql, sqlOne } from "@/lib/db";
import type { Product, ProductCategory } from "@/lib/types";

export type ProductQuery = {
  q?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  material?: string;
  style?: string;
  sort?: "price_asc" | "price_desc" | "popular" | "newest";
};

function parseProduct(row: Product): Product {
  return {
    ...row,
    dimensions:
      typeof row.dimensions === "string"
        ? JSON.parse(row.dimensions as unknown as string)
        : row.dimensions,
  };
}

export async function listProducts(query: ProductQuery): Promise<Product[]> {
  const conditions: string[] = ["stock >= 0"];
  const params: unknown[] = [];
  let i = 1;

  if (query.q) {
    conditions.push(`(name ilike $${i} or description ilike $${i})`);
    params.push(`%${query.q}%`);
    i++;
  }
  if (query.category) {
    conditions.push(`category = $${i++}`);
    params.push(query.category);
  }
  if (query.minPrice != null) {
    conditions.push(`price_cents >= $${i++}`);
    params.push(query.minPrice);
  }
  if (query.maxPrice != null) {
    conditions.push(`price_cents <= $${i++}`);
    params.push(query.maxPrice);
  }
  if (query.color) {
    conditions.push(`exists (select 1 from unnest(colors) c where c ilike $${i++})`);
    params.push(`%${query.color}%`);
  }
  if (query.material) {
    conditions.push(`material ilike $${i++}`);
    params.push(`%${query.material}%`);
  }
  if (query.style) {
    conditions.push(`exists (select 1 from unnest(style_tags) t where t ilike $${i++})`);
    params.push(`%${query.style}%`);
  }

  let orderBy = "popularity desc, created_at desc";
  switch (query.sort) {
    case "price_asc":
      orderBy = "price_cents asc";
      break;
    case "price_desc":
      orderBy = "price_cents desc";
      break;
    case "newest":
      orderBy = "created_at desc";
      break;
    case "popular":
      orderBy = "popularity desc";
      break;
  }

  const rows = await sql<Product>(
    `select * from products where ${conditions.join(" and ")} order by ${orderBy} limit 60`,
    params,
  );
  return rows.map(parseProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await sqlOne<Product>("select * from products where slug = $1", [slug]);
  return row ? parseProduct(row) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await sqlOne<Product>("select * from products where id = $1", [id]);
  return row ? parseProduct(row) : null;
}