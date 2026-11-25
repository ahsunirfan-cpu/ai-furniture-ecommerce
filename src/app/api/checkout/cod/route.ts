import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { createOrderFromCart } from "@/lib/orders/service";

const schema = z.object({
  address: z.object({
    label: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    postal_code: z.string(),
    country: z.string(),
  }),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = schema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Invalid address." }, { status: 400 });
    }
    const result = await createOrderFromCart(user.id, "COD", body.data.address, user);
    return NextResponse.json({
      orderId: result.orderId,
      message: "Order placed. Pay cash on delivery when your furniture arrives.",
    });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}