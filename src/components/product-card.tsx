import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { AddToCartButton } from "@/components/add-to-cart-button";

type Props = {
  product: Product;
  explanation?: string;
};

export function ProductCard({ product, explanation }: Props) {
  const image = product.images[0] ?? "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800";
  return (
    <Card className="overflow-hidden border-stone-200 bg-white shadow-sm">
      <CardHeader className="p-0">
        <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3]">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${product.slug}`} className="font-medium text-stone-900 hover:underline">
            {product.name}
          </Link>
          <span className="text-sm font-semibold text-amber-900">{formatPrice(product.price_cents)}</span>
        </div>
        <Badge variant="secondary" className="bg-stone-100 text-stone-700">
          {CATEGORY_LABELS[product.category]}
        </Badge>
        {explanation && (
          <p className="text-xs leading-relaxed text-stone-600">{explanation}</p>
        )}
        {product.stock < 1 && (
          <p className="text-xs font-medium text-red-700">Out of stock</p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 p-4 pt-0">
        <AddToCartButton productId={product.id} disabled={product.stock < 1} />
      </CardFooter>
    </Card>
  );
}