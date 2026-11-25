import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const [orders, revenue, lowStock] = await Promise.all([
      sql<{ count: string }>("select count(*)::text as count from orders"),
      sql<{ total: string }>(
        "select coalesce(sum(total_cents),0)::text as total from orders where payment_status = 'PAID'",
      ),
      sql("select id, name, stock from products where stock <= 5 order by stock asc limit 10"),
    ]);
    return NextResponse.json({
      orderCount: Number(orders[0]?.count ?? 0),
      paidRevenueCents: Number(revenue[0]?.total ?? 0),
      lowStock,
    });
  } catch (e) {
    const msg = (e as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === "FORBIDDEN" ? 403 : 401 });
  }
}