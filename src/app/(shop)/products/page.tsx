import { Suspense } from "react";
import { listProducts } from "@/lib/products/queries";
import type { ProductCategory } from "@/lib/types";
import { ProductsBrowser } from "@/components/products-browser";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const products = await listProducts({
    q: typeof sp.q === "string" ? sp.q : undefined,
    category: typeof sp.category === "string" ? (sp.category as ProductCategory) : undefined,
    color: typeof sp.color === "string" ? sp.color : undefined,
    material: typeof sp.material === "string" ? sp.material : undefined,
    style: typeof sp.style === "string" ? sp.style : undefined,
    sort:
      sp.sort === "price_asc" || sp.sort === "price_desc" || sp.sort === "newest"
        ? sp.sort
        : "popular",
  });

  return (
  <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Catalogue</h1>
        <p className="mt-2 text-stone-600">Search, filter, and sort every piece in stock.</p>
      </div>
      <Suspense fallback={<p>Loading filters…</p>}>
        <ProductsBrowser products={products} />
      </Suspense>
    </div>
  );
}