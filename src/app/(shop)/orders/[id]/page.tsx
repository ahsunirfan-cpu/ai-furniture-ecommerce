import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrderForUser } from "@/lib/orders/service";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const sp = await searchParams;
  const data = await getOrderForUser(user.id, id, user);
  if (!data) notFound();

  const { order, items } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Order confirmation</h1>
        {sp.paid === "1" && (
          <p className="mt-2 text-green-800">Thank you — your payment is being confirmed.</p>
        )}
        {!sp.paid && (
          <p className="mt-2 text-stone-600">
            We&apos;ve recorded your order. You&apos;ll see updates here as it moves through delivery.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>{String(order.status)}</Badge>
        <Badge variant="outline">{String(order.payment_method)}</Badge>
        <Badge variant="secondary">{String(order.payment_status)}</Badge>
      </div>
      <ul className="divide-y rounded-xl border bg-white">
        {items.map((item, i) => (
          <li key={String((item as { id?: string }).id ?? i)} className="flex justify-between p-4 text-sm">
            <span>
              {String(item.product_name)} × {Number(item.quantity)}
            </span>
            <span>{formatPrice(Number(item.unit_price_cents) * Number(item.quantity))}</span>
          </li>
        ))}
      </ul>
      <p className="text-lg font-semibold">Total: {formatPrice(Number(order.total_cents))}</p>
    </div>
  );
}