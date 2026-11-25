import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartLines } from "@/lib/cart/service";
import { CheckoutForm } from "@/components/checkout-form";

const DELIVERY_CENTS = 1500;

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");
  const lines = await getCartLines(user.id, user);
  if (lines.length === 0) redirect("/cart");
  const subtotal = lines.reduce((s, l) => s + l.price_cents * l.quantity, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <CheckoutForm subtotalCents={subtotal} deliveryCents={DELIVERY_CENTS} />
    </div>
  );
}