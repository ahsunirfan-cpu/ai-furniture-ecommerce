"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product, ProductCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

export function ProductsBrowser({ products }: { products: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-xl border border-stone-200 bg-white p-4 md:grid-cols-6"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const next = new URLSearchParams();
          for (const key of ["q", "category", "color", "material", "style", "sort"]) {
            const v = String(fd.get(key) ?? "").trim();
            if (v && v !== "all") next.set(key, v);
          }
          router.push(`/products?${next.toString()}`);
        }}
      >
        <div className="md:col-span-2">
          <Label htmlFor="q" className="sr-only">
            Search
          </Label>
          <Input id="q" name="q" placeholder="Search furniture…" defaultValue={params.get("q") ?? ""} />
        </div>
        <select
          name="category"
          defaultValue={params.get("category") ?? "all"}
          className="h-9 rounded-md border border-stone-200 bg-white px-3 text-sm"
        >
          <option value="all">All categories</option>
          {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <Input name="color" placeholder="Colour" defaultValue={params.get("color") ?? ""} />
        <select
          name="sort"
          defaultValue={params.get("sort") ?? "popular"}
          className="h-9 rounded-md border border-stone-200 bg-white px-3 text-sm"
        >
          <option value="popular">Popularity</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="newest">Newest</option>
        </select>
        <Button type="submit">Apply</Button>
      </form>

      {products.length === 0 ? (
        <p className="text-stone-600">No products match your filters.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}