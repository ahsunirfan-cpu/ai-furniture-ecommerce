import "server-only";

/** Vercel/client demo: catalogue from repo JSON, mocked AI, no paid APIs. */
export function isClientDemo(): boolean {
  return process.env.CLIENT_DEMO === "true";
}

export function useMockAi(): boolean {
  return isClientDemo() || process.env.AI_MOCK === "true" || !process.env.OPENAI_API_KEY?.trim();
}

/** Serverless demo without Postgres — cart/orders in encrypted session. */
export function useSessionStore(): boolean {
  return isClientDemo() && !process.env.DATABASE_URL?.trim();
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}