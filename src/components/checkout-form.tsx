"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";

export function CheckoutForm({
  subtotalCents,
  deliveryCents,
}: {
  subtotalCents: number;
  deliveryCents: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"cod" | "stripe" | null>(null);

  async function submit(payment: "cod" | "stripe", form: HTMLFormElement) {
    setLoading(payment);
    const fd = new FormData(form);
    const address = {
      label: String(fd.get("label") || "Home"),
      line1: String(fd.get("line1")),
      line2: String(fd.get("line2") || "") || undefined,
      city: String(fd.get("city")),
      postal_code: String(fd.get("postal_code")),
      country: String(fd.get("country") || "United Kingdom"),
    };

    const endpoint = payment === "cod" ? "/api/checkout/cod" : "/api/checkout/stripe";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    const data = await res.json();
    setLoading(null);

    if (!res.ok) {
      toast.error(data.error ?? "Checkout failed");
      return;
    }

    if (payment === "stripe" && data.url) {
      window.location.href = data.url;
      return;
    }

    toast.success(data.message ?? "Order placed");
    router.push(`/orders/${data.orderId}`);
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        id="checkout-form"
        className="space-y-4 rounded-xl border bg-white p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <h2 className="text-lg font-semibold">Delivery address</h2>
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input id="label" name="label" defaultValue="Home" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="line1">Address line 1</Label>
          <Input id="line1" name="line1" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="line2">Address line 2</Label>
          <Input id="line2" name="line2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postcode</Label>
            <Input id="postal_code" name="postal_code" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue="United Kingdom" required />
        </div>
      </form>

      <div className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Payment</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>{formatPrice(deliveryCents)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(subtotalCents + deliveryCents)}</dd>
          </div>
        </dl>
        <Button
          className="w-full"
          disabled={!!loading}
          onClick={() => {
            const form = document.getElementById("checkout-form") as HTMLFormElement;
            void submit("cod", form);
          }}
        >
          {loading === "cod" ? "Placing order…" : "Place order — Cash on delivery"}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          disabled={!!loading}
          onClick={() => {
            const form = document.getElementById("checkout-form") as HTMLFormElement;
            void submit("stripe", form);
          }}
        >
          {loading === "stripe" ? "Redirecting…" : "Pay online (Stripe)"}
        </Button>
        <p className="text-xs text-stone-500">Card details are handled by Stripe; we never store them.</p>
      </div>
    </div>
  );
}