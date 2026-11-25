import "server-only";

import { sql, sqlOne } from "@/lib/db";
import { useSessionStore } from "@/lib/config";
import { demoGetOrder, demoListOrders, demoPlaceOrder } from "@/lib/demo/session-store";
import type { SessionUser } from "@/lib/auth/session";
import { clearCart, getCartLines } from "@/lib/cart/service";

const DELIVERY_CENTS = 1500;

export type DeliveryAddress = {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postal_code: string;
  country: string;
};

export async function createOrderFromCart(
  userId: string,
  paymentMethod: "STRIPE" | "COD",
  address: DeliveryAddress,
  user?: SessionUser,
) {
  if (useSessionStore() && user) {
    const order = await demoPlaceOrder(user, paymentMethod, address as Record<string, string>);
    return {
      orderId: order.id,
      subtotal: order.subtotal_cents,
      total: order.total_cents,
      delivery: order.delivery_cents,
    };
  }

  const lines = await getCartLines(userId, user);
  if (lines.length === 0) throw new Error("Cart is empty");

  const subtotal = lines.reduce((sum, l) => sum + l.price_cents * l.quantity, 0);
  const total = subtotal + DELIVERY_CENTS;

  const order = await sqlOne<{ id: string }>(
    `insert into orders (
      user_id, payment_method, payment_status, subtotal_cents, delivery_cents, total_cents, delivery_address
    ) values ($1, $2, $3, $4, $5, $6, $7)
    returning id`,
    [
      userId,
      paymentMethod,
      paymentMethod === "COD" ? "PENDING" : "PENDING",
      subtotal,
      DELIVERY_CENTS,
      total,
      JSON.stringify(address),
    ],
  );

  for (const line of lines) {
    await sql(
      `insert into order_items (order_id, product_id, quantity, unit_price_cents, product_name)
       values ($1, $2, $3, $4, $5)`,
      [order!.id, line.product_id, line.quantity, line.price_cents, line.name],
    );
    await sql(
      `update products set stock = greatest(stock - $1, 0) where id = $2`,
      [line.quantity, line.product_id],
    );
  }

  await clearCart(userId);
  return { orderId: order!.id, subtotal, total, delivery: DELIVERY_CENTS };
}

export async function listOrdersForUser(userId: string, user?: SessionUser) {
  if (useSessionStore() && user) {
    return demoListOrders(user);
  }
  return sql(
    `select id, status, payment_method, payment_status, total_cents, created_at
     from orders where user_id = $1 order by created_at desc`,
    [userId],
  );
}

export async function getOrderForUser(userId: string, orderId: string, user?: SessionUser) {
  if (useSessionStore() && user) {
    return demoGetOrder(user!, orderId);
  }
  const order = await sqlOne(
    `select * from orders where id = $1 and user_id = $2`,
    [orderId, userId],
  );
  if (!order) return null;
  const items = await sql(
    `select * from order_items where order_id = $1`,
    [orderId],
  );
  return { order, items };
}

export async function markOrderPaid(stripeSessionId: string) {
  await sql(
    `update orders set payment_status = 'PAID', status = 'CONFIRMED'
     where stripe_session_id = $1`,
    [stripeSessionId],
  );
}

export async function setStripeSession(orderId: string, sessionId: string) {
  await sql(`update orders set stripe_session_id = $1 where id = $2`, [sessionId, orderId]);
}