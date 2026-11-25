import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sqlOne } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid registration details." }, { status: 400 });
  }

  const { email, password, name } = body.data;
  const existing = await sqlOne("select id from users where email = $1", [email.toLowerCase()]);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await sqlOne<{ id: string; email: string; name: string; role: string }>(
    `insert into users (email, password_hash, name) values ($1, $2, $3)
     returning id, email, name, role`,
    [email.toLowerCase(), password_hash, name],
  );

  const session = await getSession();
  session.user = {
    id: user!.id,
    email: user!.email,
    name: user!.name,
    role: user!.role as "USER" | "ADMIN",
  };
  await session.save();

  return NextResponse.json({ ok: true });
}