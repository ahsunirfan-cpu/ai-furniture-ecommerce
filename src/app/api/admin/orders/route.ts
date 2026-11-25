import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const orders = await sql(
      `select o.*, u.email, u.name as customer_name
       from orders o join users u on u.id = o.user_id
       order by o.created_at desc`,
    );
    return NextResponse.json({ orders });
  } catch (e) {
    const msg = (e as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === "FORBIDDEN" ? 403 : 401 });
  }
}

const schema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Invalid update." }, { status: 400 });
    }
    await sql("update orders set status = $1 where id = $2", [body.data.status, body.data.orderId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = (e as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === "FORBIDDEN" ? 403 : 401 });
  }
}