import "server-only";

import { randomUUID } from "node:crypto";
import {
  getSession,
  type AppSession,
  type DemoOrderCookie,
  type SessionUser,
} from "@/lib/auth/session";
import type { CartLine } from "@/lib/types";
import { getDemoProductById, loadDemoProducts } from "@/lib/demo/catalog";

const DELIVERY_CENTS = 1500;

type DemoOrder = DemoOrderCookie;

export async function readDemoState(): Promise<{
  cart: CartLine[];
  wishlist: string[];
  orders: DemoOrder[];
  roomUsageToday: number;
}> {
  const session = await getSession();
  return {
    cart: session.demoCart ?? [],
    wishlist: session.demoWishlist ?? [],
    orders: session.demoOrders ?? [],
    roomUsageToday: session.demoRoomUsageToday ?? 0,
  };
}

async function writeDemoState(patch: Partial<AppSession>) {
  const session = await getSession();
  Object.assign(session, patch);
  await session.save();
}

export async function demoCartLines(user: SessionUser): Promise<CartLine[]> {
  const { cart } = await readDemoState();
  return cart;
}

export async function demoAddToCart(user: SessionUser, productId: string, quantity = 1) {
  const product = await getDemoProductById(productId);
  if (!product || product.stock < 1) throw new Error("Out of stock");

  const { cart } = await readDemoState();
  const existing = cart.find((l) => l.product_id === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
  } else {
    cart.push({
      id: randomUUID(),
      product_id: productId,
      quantity,
      name: product.name,
      slug: product.slug,
      price_cents: product.price_cents,
      image: product.images[0] ?? "",
      stock: product.stock,
    });
  }
  await writeDemoState({ demoCart: cart });
}

export async function demoUpdateCartQuantity(user: SessionUser, itemId: string, quantity: number) {
  let { cart } = await readDemoState();
  if (quantity < 1) {
    cart = cart.filter((l) => l.id !== itemId);
  } else {
    cart = cart.map((l) => (l.id === itemId ? { ...l, quantity } : l));
  }
  await writeDemoState({ demoCart: cart });
}

export async function demoToggleWishlist(productId: string): Promise<boolean> {
  const { wishlist } = await readDemoState();
  const has = wishlist.includes(productId);
  const next = has ? wishlist.filter((id) => id !== productId) : [...wishlist, productId];
  await writeDemoState({ demoWishlist: next });
  return !has;
}

export async function demoWishlistProducts() {
  const { wishlist } = await readDemoState();
  const all = await loadDemoProducts();
  return all.filter((p) => wishlist.includes(p.id));
}

export async function demoPlaceOrder(
  user: SessionUser,
  paymentMethod: "STRIPE" | "COD",
  address: Record<string, string>,
) {
  const { cart, orders } = await readDemoState();
  if (cart.length === 0) throw new Error("Cart is empty");
  const subtotal = cart.reduce((s, l) => s + l.price_cents * l.quantity, 0);
  const order: DemoOrder = {
    id: randomUUID(),
    user_id: user.id,
    status: "CONFIRMED",
    payment_method: paymentMethod,
    payment_status: paymentMethod === "COD" ? "PENDING" : "PENDING",
    subtotal_cents: subtotal,
    delivery_cents: DELIVERY_CENTS,
    total_cents: subtotal + DELIVERY_CENTS,
    delivery_address: address,
    created_at: new Date().toISOString(),
    items: cart.map((l) => ({
      product_name: l.name,
      quantity: l.quantity,
      unit_price_cents: l.price_cents,
    })),
  };
  await writeDemoState({ demoCart: [], demoOrders: [order, ...orders].slice(0, 20) });
  return order;
}

export async function demoListOrders(user: SessionUser) {
  const { orders } = await readDemoState();
  return orders.filter((o) => o.user_id === user.id);
}

export async function demoGetOrder(user: SessionUser, orderId: string) {
  const { orders } = await readDemoState();
  const order = orders.find((o) => o.id === orderId && o.user_id === user.id);
  if (!order) return null;
  return { order, items: order.items };
}

const ROOM_LIMIT_PER_DAY = 15;

export async function demoBumpRoomUsage(): Promise<void> {
  const session = await getSession();
  const count = (session.demoRoomUsageToday ?? 0) + 1;
  if (count > ROOM_LIMIT_PER_DAY) {
    throw new Error("RATE_LIMIT");
  }
  session.demoRoomUsageToday = count;
  await session.save();
}