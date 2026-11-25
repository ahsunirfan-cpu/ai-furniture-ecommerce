"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  productId,
  disabled,
  label = "Add to cart",
}: {
  productId: string;
  disabled?: boolean;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <Button
      size="sm"
      className="w-full"
      disabled={disabled || loading}
      onClick={async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
          const data = await res.json();
          if (!res.ok) {
            if (res.status === 401) {
              toast.error("Please sign in to add items to your cart.");
              router.push("/login");
              return;
            }
            throw new Error(data.error ?? "Could not add to cart");
          }
          toast.success("Added to cart");
          router.refresh();
        } catch (e) {
          toast.error((e as Error).message);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Adding…" : label}
    </Button>
  );
}