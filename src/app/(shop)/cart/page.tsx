import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartLines } from "@/lib/cart/service";
import { CartClient } from "@/components/cart-client";

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");
  const lines = await getCartLines(user.id, user);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Your cart</h1>
      <CartClient initialLines={lines} />
    </div>
  );
}