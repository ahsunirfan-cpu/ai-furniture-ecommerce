"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { CartLine } from "@/lib/types";

export function CartClient({ initialLines }: { initialLines: CartLine[] }) {
  const router = useRouter();
  const subtotal = initialLines.reduce((s, l) => s + l.price_cents * l.quantity, 0);

  return (
    <div className="space-y-6">
      {initialLines.length === 0 ? (
        <p className="text-stone-600">
          Your cart is empty.{" "}
          <Link href="/products" className="underline">
            Browse furniture
          </Link>
        </p>
      ) : (
        <>
          <ul className="divide-y rounded-xl border bg-white">
            {initialLines.map((line) => (
              <li key={line.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="relative h-20 w-24 overflow-hidden rounded-md">
                  {line.image && (
                    <Image src={line.image} alt="" fill className="object-cover" sizes="96px" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${line.slug}`} className="font-medium hover:underline">
                    {line.name}
                  </Link>
                  <p className="text-sm text-stone-600">{formatPrice(line.price_cents)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const res = await fetch("/api/cart", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ itemId: line.id, quantity: line.quantity - 1 }),
                      });
                      if (!res.ok) toast.error("Could not update quantity");
                      else router.refresh();
                    }}
                  >
                    −
                  </Button>
                  <span className="w-8 text-center">{line.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const res = await fetch("/api/cart", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ itemId: line.id, quantity: line.quantity + 1 }),
                      });
                      if (!res.ok) toast.error("Could not update quantity");
                      else router.refresh();
                    }}
                  >
                    +
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between rounded-xl border bg-white p-4">
            <span className="font-medium">Subtotal</span>
            <span className="text-lg font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <Link href="/checkout" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}>
            Proceed to checkout
          </Link>
        </>
      )}
    </div>
  );
}