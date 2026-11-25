import { NextResponse } from "next/server";
import { z } from "zod";
import { isClientDemo } from "@/lib/config";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  if (isClientDemo()) {
    return NextResponse.json({
      ok: true,
      message:
        "Password reset is disabled in the client demo. Use the demo accounts listed in the README.",
    });
  }

  // Production: integrate email provider; never return reset tokens in API responses.
  return NextResponse.json({
    ok: true,
    message: "If an account exists for this email, we'll send reset instructions shortly.",
  });
}