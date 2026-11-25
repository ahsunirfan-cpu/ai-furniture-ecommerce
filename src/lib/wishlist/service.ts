import "server-only";

import { sql } from "@/lib/db";
import { useSessionStore } from "@/lib/config";
import { demoToggleWishlist, demoWishlistProducts } from "@/lib/demo/session-store";

export async function toggleWishlist(userId: string, productId: string): Promise<boolean> {
  if (useSessionStore()) return demoToggleWishlist(productId);
  const existing = await sql<{ id: string }>(
    "select id from wishlist_items where user_id = $1 and product_id = $2",
    [userId, productId],
  );
  if (existing.length > 0) {
    await sql("delete from wishlist_items where user_id = $1 and product_id = $2", [
      userId,
      productId,
    ]);
    return false;
  }
  await sql("insert into wishlist_items (user_id, product_id) values ($1, $2)", [
    userId,
    productId,
  ]);
  return true;
}

export async function listWishlist(userId: string) {
  if (useSessionStore()) return demoWishlistProducts();
  return sql(
    `select p.* from wishlist_items w
     join products p on p.id = w.product_id
     where w.user_id = $1
     order by w.created_at desc`,
    [userId],
  );
}

export async function isWishlisted(userId: string, productId: string) {
  const rows = await sql(
    "select 1 from wishlist_items where user_id = $1 and product_id = $2 limit 1",
    [userId, productId],
  );
  return rows.length > 0;
}