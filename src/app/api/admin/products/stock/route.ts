import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { sql } from "@/lib/db";

const schema = z.object({
  id: z.string().uuid(),
  stock: z.number().int().min(0),
});

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = schema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await sql("update products set stock = $1 where id = $2", [body.data.stock, body.data.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = (e as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === "FORBIDDEN" ? 403 : 401 });
  }
}