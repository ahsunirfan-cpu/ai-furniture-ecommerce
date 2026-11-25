import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { sql, sqlOne } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();
    const addresses = await sql(
      "select * from addresses where user_id = $1 order by is_default desc, created_at asc",
      [user.id],
    );
    return NextResponse.json({ user, addresses });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}

const profileSchema = z.object({ name: z.string().min(1) });

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = profileSchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }
    await sqlOne(
      "update users set name = $1 where id = $2 returning id",
      [body.data.name, user.id],
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}

const addressSchema = z.object({
  label: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  postal_code: z.string(),
  country: z.string(),
  is_default: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = addressSchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Invalid address." }, { status: 400 });
    }
    if (body.data.is_default) {
      await sql("update addresses set is_default = false where user_id = $1", [user.id]);
    }
    const address = await sqlOne(
      `insert into addresses (user_id, label, line1, line2, city, postal_code, country, is_default)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
      [
        user.id,
        body.data.label,
        body.data.line1,
        body.data.line2 ?? null,
        body.data.city,
        body.data.postal_code,
        body.data.country,
        body.data.is_default ?? false,
      ],
    );
    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}