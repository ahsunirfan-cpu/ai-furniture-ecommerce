import "server-only";

import { sql } from "@/lib/db";
import type { Product, ProductCategory, RoomAnalysisResult, RoomType } from "@/lib/types";
import { ROOM_CATEGORY_MAP } from "@/lib/types";

export type RecommendFilters = {
  category?: ProductCategory;
  minPriceCents?: number;
  maxPriceCents?: number;
  color?: string;
  style?: string;
};

export type ScoredProduct = Product & {
  score: number;
  explanation: string;
};

function colorDistance(hex: string, other: string): number {
  const parse = (h: string) => {
    const c = h.replace("#", "");
    if (c.length !== 6) return null;
    return [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16));
  };
  const a = parse(hex);
  const b = parse(other);
  if (!a || !b) return 100;
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
}

function buildExplanation(
  product: Product,
  analysis: RoomAnalysisResult,
  reasons: string[],
): string {
  if (reasons.length === 0) {
    return `Fits your ${analysis.interiorStyle} ${analysis.freeSpaceEstimate} space with complementary tones.`;
  }
  return reasons.join(" ");
}

export async function recommendProducts(
  roomType: RoomType,
  analysis: RoomAnalysisResult,
  filters: RecommendFilters,
  limit = 12,
): Promise<ScoredProduct[]> {
  const allowed = filters.category
    ? [filters.category]
    : ROOM_CATEGORY_MAP[roomType];

  const products = await sql<Product>(
    `select * from products
     where stock > 0
     and category::text = any($1::text[])
     order by popularity desc`,
    [allowed],
  );

  const filtered = products.filter((p) => {
    if (filters.minPriceCents != null && p.price_cents < filters.minPriceCents) return false;
    if (filters.maxPriceCents != null && p.price_cents > filters.maxPriceCents) return false;
    if (filters.color && !p.colors.some((c) => c.toLowerCase().includes(filters.color!.toLowerCase())))
      return false;
    if (filters.style && !p.style_tags.some((t) => t.toLowerCase().includes(filters.style!.toLowerCase())))
      return false;
    return true;
  });

  const scored = filtered.map((product) => {
    let score = product.popularity;
    const reasons: string[] = [];

    if (product.style_tags.some((t) => t.toLowerCase() === analysis.interiorStyle.toLowerCase())) {
      score += 40;
      reasons.push(`Matches your ${analysis.interiorStyle} style.`);
    } else if (
      product.style_tags.some((t) =>
        analysis.interiorStyle.toLowerCase().includes(t.replace("_", " ")),
      )
    ) {
      score += 20;
      reasons.push(`Echoes the ${analysis.interiorStyle} look in your photo.`);
    }

    const palette = analysis.colorPalette ?? [];
    if (palette.length > 0 && product.colors.length > 0) {
      const minDist = Math.min(
        ...palette.flatMap((hex) =>
          product.colors.map((c) => colorDistance(hex, guessHex(c))),
        ),
      );
      if (minDist < 80) {
        score += 25;
        reasons.push("Colour palette aligns with your room.");
      }
    }

    const dims = product.dimensions;
    if (analysis.freeSpaceEstimate === "small" && dims.widthCm <= 150) {
      score += 15;
      reasons.push("Compact footprint suits limited free space.");
    } else if (analysis.freeSpaceEstimate === "large" && dims.widthCm >= 160) {
      score += 10;
      reasons.push("Generous scale works in an open layout.");
    }

    return {
      ...product,
      dimensions:
        typeof product.dimensions === "string"
          ? JSON.parse(product.dimensions as unknown as string)
          : product.dimensions,
      score,
      explanation: buildExplanation(product, analysis, reasons),
    };
  });

  scored.sort((a, b) => b.score - a.score || b.popularity - a.popularity || a.name.localeCompare(b.name));
  return scored.slice(0, limit);
}

function guessHex(colorName: string): string {
  const map: Record<string, string> = {
    oak: "#C4A574",
    walnut: "#5C4033",
    white: "#F5F5F5",
    grey: "#9E9E9E",
    gray: "#9E9E9E",
    charcoal: "#36454F",
    navy: "#1B2A4A",
    stone: "#B8A99A",
    natural: "#D4B896",
    black: "#222222",
    ivory: "#FFFFF0",
    emerald: "#2E6F4E",
    blush: "#E8B4B8",
    camel: "#C19A6B",
    brass: "#B5A642",
    linen: "#E8E2D9",
    sage: "#9CAF88",
    slate: "#708090",
    forest: "#228B22",
    mustard: "#E1AD01",
    cream: "#FFFDD0",
  };
  return map[colorName.toLowerCase()] ?? "#CCCCCC";
}