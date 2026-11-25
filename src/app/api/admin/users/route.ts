import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const users = await sql(
      "select id, email, name, role, created_at from users order by created_at desc",
    );
    return NextResponse.json({ users });
  } catch (e) {
    const msg = (e as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === "FORBIDDEN" ? 403 : 401 });
  }
}