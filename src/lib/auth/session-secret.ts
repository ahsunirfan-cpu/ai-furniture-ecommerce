import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { isClientDemo, isProductionRuntime } from "@/lib/config";

/** Stable demo sessions per Vercel project when AUTH_SECRET is not set (public client demo only). */
function vercelDemoFallbackSecret(): string | undefined {
  const projectId = process.env.VERCEL_PROJECT_ID?.trim();
  if (!projectId) return undefined;
  return createHash("sha256").update(`roomcraft-client-demo:${projectId}`).digest("base64");
}

let devEphemeralSecret: string | undefined;

export function getSessionSecret(): string {
  const fromEnv = process.env.AUTH_SECRET?.trim();
  if (fromEnv && fromEnv.length >= 32) return fromEnv;

  // Published client demo on Vercel: set AUTH_SECRET in project settings (see docs).
  if (isProductionRuntime() && !isClientDemo()) {
    throw new Error("AUTH_SECRET must be set in production");
  }

  if (isProductionRuntime() && isClientDemo()) {
    const fallback = vercelDemoFallbackSecret();
    if (fallback) return fallback;
    throw new Error(
      "AUTH_SECRET must be set for the client demo (generate with: openssl rand -base64 32)",
    );
  }

  devEphemeralSecret ??= randomBytes(32).toString("base64");
  return devEphemeralSecret;
}