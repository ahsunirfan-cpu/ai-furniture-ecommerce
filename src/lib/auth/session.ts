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

export type AppSession = {
  user?: SessionUser;
};

const sessionOptions: SessionOptions = {
  password:
    process.env.AUTH_SECRET?.trim() ||
    "dev-only-secret-change-in-production-32chars!",
  cookieName: "roomcraft_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession(): Promise<IronSession<AppSession>> {
  return getIronSession<AppSession>(await cookies(), sessionOptions);
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