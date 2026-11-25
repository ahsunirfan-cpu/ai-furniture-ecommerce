import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listOrdersForUser } from "@/lib/orders/service";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/orders");
  const orders = await listOrdersForUser(user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Your orders</h1>
      {orders.length === 0 ? (
        <p className="text-stone-600">No orders yet.</p>
      ) : (
        <ul className="divide-y rounded-xl border bg-white">
          {orders.map((order) => (
            <li key={order.id as string} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link href={`/orders/${order.id}`} className="font-medium hover:underline">
                  Order {String(order.id).slice(0, 8)}
                </Link>
                <p className="text-sm text-stone-600">
                  {new Date(order.created_at as string).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{String(order.status)}</Badge>
                <span className="font-semibold">{formatPrice(Number(order.total_cents))}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}