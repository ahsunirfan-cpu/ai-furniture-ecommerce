import "server-only";

import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/types";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

import type { CartLine } from "@/lib/types";
import { getSessionSecret } from "@/lib/auth/session-secret";

export type DemoOrderCookie = {
  id: string;
  user_id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_cents: number;
  subtotal_cents: number;
  delivery_cents: number;
  delivery_address: Record<string, unknown>;
  created_at: string;
  items: { product_name: string; quantity: number; unit_price_cents: number }[];
};

export type AppSession = {
  user?: SessionUser;
  demoCart?: CartLine[];
  demoWishlist?: string[];
  demoOrders?: DemoOrderCookie[];
  demoRoomUsageToday?: number;
};

function sessionOptions(): SessionOptions {
  return {
    password: getSessionSecret(),
    cookieName: "roomcraft_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  };
}

export async function getSession(): Promise<IronSession<AppSession>> {
  return getIronSession<AppSession>(await cookies(), sessionOptions());
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session.user ?? null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}