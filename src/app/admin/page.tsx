import { sql } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [orders, revenue, lowStock] = await Promise.all([
    sql<{ count: string }>("select count(*)::text as count from orders"),
    sql<{ total: string }>(
      "select coalesce(sum(total_cents),0)::text as total from orders where payment_status = 'PAID'",
    ),
    sql<{ name: string; stock: number }>(
      "select name, stock from products where stock <= 5 order by stock asc limit 8",
    ),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{orders[0]?.count ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paid revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {formatPrice(Number(revenue[0]?.total ?? 0))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Low stock</CardTitle>
        </CardHeader>
        <CardContent>
          {lowStock.length === 0 ? (
            <p className="text-sm text-stone-600">All products sufficiently stocked.</p>
          ) : (
            <ul className="text-sm">
              {lowStock.map((p) => (
                <li key={p.name}>
                  {p.name} — {p.stock} left
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}