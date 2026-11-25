import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sqlOne, sql } from "@/lib/db";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const user = await sqlOne<{ id: string }>("select id from users where email = $1", [
    body.data.email.toLowerCase(),
  ]);

  let resetToken: string | undefined;
  if (user) {
    const token = randomBytes(32).toString("hex");
    const token_hash = createHash("sha256").update(token).digest("hex");
    await sql(
      `insert into password_reset_tokens (user_id, token_hash, expires_at)
       values ($1, $2, now() + interval '1 hour')`,
      [user.id, token_hash],
    );
    resetToken = token;
  }

  return NextResponse.json({
    ok: true,
    message:
      "If an account exists for this email, a reset link has been sent. In this demo, use the token below.",
    demoResetToken: resetToken,
  });
}