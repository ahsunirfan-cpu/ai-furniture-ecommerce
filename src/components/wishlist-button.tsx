"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function WishlistButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={loading}
      aria-label="Save to wishlist"
      onClick={async () => {
        setLoading(true);
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        const data = await res.json();
        setLoading(false);
        if (res.status === 401) {
          toast.error("Sign in to save items.");
          router.push("/login");
          return;
        }
        if (!res.ok) {
          toast.error(data.error ?? "Could not update wishlist");
          return;
        }
        toast.success(data.saved ? "Saved to wishlist" : "Removed from wishlist");
        router.refresh();
      }}
    >
      <Heart className="h-4 w-4" />
    </Button>
  );
}