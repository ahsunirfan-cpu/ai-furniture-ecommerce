import "server-only";

import { randomBytes } from "node:crypto";
import { isClientDemo, isProductionRuntime } from "@/lib/config";

let devEphemeralSecret: string | undefined;

export function getSessionSecret(): string {
  const fromEnv = process.env.AUTH_SECRET?.trim();
  if (fromEnv && fromEnv.length >= 32) return fromEnv;

  // Published client demo on Vercel: set AUTH_SECRET in project settings (see docs).
  if (isProductionRuntime() && !isClientDemo()) {
    throw new Error("AUTH_SECRET must be set in production");
  }

  if (isProductionRuntime() && isClientDemo()) {
    throw new Error(
      "AUTH_SECRET must be set for the client demo (generate with: openssl rand -base64 32)",
    );
  }

  devEphemeralSecret ??= randomBytes(32).toString("base64");
  return devEphemeralSecret;
}