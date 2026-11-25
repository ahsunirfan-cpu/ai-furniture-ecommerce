import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug } from "@/lib/products/queries";
import { formatPrice } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/types";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist-button";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const image = product.images[0] ?? "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800";

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-white">
        <Image src={image} alt={product.name} fill className="object-cover" sizes="50vw" />
      </div>
      <div className="space-y-5">
        <Badge variant="secondary">{CATEGORY_LABELS[product.category]}</Badge>
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="text-2xl font-semibold text-amber-900">{formatPrice(product.price_cents)}</p>
        <p className="text-stone-700">{product.description}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-stone-500">Material</dt>
            <dd>{product.material}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Colours</dt>
            <dd>{product.colors.join(", ")}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Dimensions (cm)</dt>
            <dd>
              W {product.dimensions.widthCm} × D {product.dimensions.depthCm} × H{" "}
              {product.dimensions.heightCm}
            </dd>
          </div>
          <div>
            <dt className="text-stone-500">In stock</dt>
            <dd>{product.stock}</dd>
          </div>
        </dl>
        <div className="flex gap-3">
          <AddToCartButton productId={product.id} disabled={product.stock < 1} />
          <WishlistButton productId={product.id} />
        </div>
      </div>
    </div>
  );
}