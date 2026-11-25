import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sqlOne } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
  }

  const user = await sqlOne<{ id: string; email: string; name: string; role: string; password_hash: string }>(
    "select id, email, name, role, password_hash from users where email = $1",
    [body.data.email.toLowerCase()],
  );
  if (!user || !(await bcrypt.compare(body.data.password, user.password_hash))) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  const session = await getSession();
  session.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "USER" | "ADMIN",
  };
  await session.save();

  return NextResponse.json({ ok: true, role: user.role });
}