import "server-only";

import { sql, sqlOne } from "@/lib/db";
import { useSessionStore } from "@/lib/config";
import {
  demoAddToCart,
  demoCartLines,
  demoUpdateCartQuantity,
} from "@/lib/demo/session-store";
import type { SessionUser } from "@/lib/auth/session";
import type { Product, CartLine } from "@/lib/types";

export type { CartLine };

async function ensureCart(userId: string): Promise<string> {
  const existing = await sqlOne<{ id: string }>(
    "select id from carts where user_id = $1",
    [userId],
  );
  if (existing) return existing.id;
  const created = await sqlOne<{ id: string }>(
    "insert into carts (user_id) values ($1) returning id",
    [userId],
  );
  return created!.id;
}

export async function getCartLines(userId: string, user?: SessionUser): Promise<CartLine[]> {
  if (useSessionStore() && user) return demoCartLines(user);
  const cartId = await ensureCart(userId);
  return sql<CartLine>(
    `select ci.id, ci.product_id, ci.quantity, p.name, p.slug, p.price_cents,
            coalesce(p.images[1], '') as image, p.stock
     from cart_items ci
     join products p on p.id = ci.product_id
     where ci.cart_id = $1`,
    [cartId],
  );
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity = 1,
  user?: SessionUser,
) {
  if (useSessionStore() && user) {
    await demoAddToCart(user, productId, quantity);
    return;
  }
  const cartId = await ensureCart(userId);
  const product = await sqlOne<Product>("select stock from products where id = $1", [productId]);
  if (!product || product.stock < 1) throw new Error("Out of stock");

  await sql(
    `insert into cart_items (cart_id, product_id, quantity)
     values ($1, $2, $3)
     on conflict (cart_id, product_id)
     do update set quantity = least(cart_items.quantity + excluded.quantity, $4)`,
    [cartId, productId, quantity, product.stock],
  );
}

export async function updateCartQuantity(
  userId: string,
  itemId: string,
  quantity: number,
  user?: SessionUser,
) {
  if (useSessionStore() && user) {
    await demoUpdateCartQuantity(user, itemId, quantity);
    return;
  }
  const cartId = await ensureCart(userId);
  if (quantity < 1) {
    await sql("delete from cart_items where id = $1 and cart_id = $2", [itemId, cartId]);
    return;
  }
  await sql(
    `update cart_items set quantity = $1 where id = $2 and cart_id = $3`,
    [quantity, itemId, cartId],
  );
}

export async function clearCart(userId: string) {
  const cartId = await ensureCart(userId);
  await sql("delete from cart_items where cart_id = $1", [cartId]);
}