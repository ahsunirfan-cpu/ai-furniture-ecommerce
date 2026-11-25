import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getCartLines } from "@/lib/cart/service";
import { sqlOne, sql } from "@/lib/db";

const DELIVERY_CENTS = 1500;

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

    const lines = await getCartLines(user.id);
    if (lines.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      return NextResponse.json(
        {
          error: "Online payments are not configured. Use cash on delivery or add STRIPE_SECRET_KEY.",
          mock: true,
        },
        { status: 503 },
      );
    }

    const subtotal = lines.reduce((s, l) => s + l.price_cents * l.quantity, 0);
    const total = subtotal + DELIVERY_CENTS;

    const order = await sqlOne<{ id: string }>(
      `insert into orders (
        user_id, payment_method, payment_status, subtotal_cents, delivery_cents, total_cents, delivery_address
      ) values ($1, 'STRIPE', 'PENDING', $2, $3, $4, $5) returning id`,
      [user.id, subtotal, DELIVERY_CENTS, total, JSON.stringify(body.data.address)],
    );

    for (const line of lines) {
      await sql(
        `insert into order_items (order_id, product_id, quantity, unit_price_cents, product_name)
         values ($1, $2, $3, $4, $5)`,
        [order!.id, line.product_id, line.quantity, line.price_cents, line.name],
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/orders/${order!.id}?paid=1`,
      cancel_url: `${origin}/checkout?cancelled=1`,
      metadata: { orderId: order!.id, userId: user.id },
      line_items: [
        ...lines.map((line) => ({
          quantity: line.quantity,
          price_data: {
            currency: "gbp",
            unit_amount: line.price_cents,
            product_data: { name: line.name },
          },
        })),
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: DELIVERY_CENTS,
            product_data: { name: "Delivery" },
          },
        },
      ],
    });

    await sql(`update orders set stripe_session_id = $1 where id = $2`, [session.id, order!.id]);

    return NextResponse.json({ url: session.url, orderId: order!.id });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}