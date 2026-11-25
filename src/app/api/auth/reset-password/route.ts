import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sqlOne, sql } from "@/lib/db";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid reset request." }, { status: 400 });
  }

  const token_hash = createHash("sha256").update(body.data.token).digest("hex");
  const row = await sqlOne<{ id: string; user_id: string }>(
    `select id, user_id from password_reset_tokens
     where token_hash = $1 and used_at is null and expires_at > now()
     order by created_at desc limit 1`,
    [token_hash],
  );
  if (!row) {
    return NextResponse.json({ error: "Reset token is invalid or expired." }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(body.data.password, 10);
  await sql("update users set password_hash = $1 where id = $2", [password_hash, row.user_id]);
  await sql("update password_reset_tokens set used_at = now() where id = $1", [row.id]);

  return NextResponse.json({ ok: true });
}