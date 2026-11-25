import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listWishlist } from "@/lib/wishlist/service";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

function parseProduct(row: Record<string, unknown>): Product {
  return {
    ...(row as Product),
    dimensions:
      typeof row.dimensions === "string"
        ? JSON.parse(row.dimensions as string)
        : (row.dimensions as Product["dimensions"]),
  };
}

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/wishlist");
  const rows = await listWishlist(user.id);
  const products = rows.map((r) => parseProduct(r as Record<string, unknown>));

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Wishlist</h1>
      {products.length === 0 ? (
        <p className="text-stone-600">Saved items will appear here.</p>
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