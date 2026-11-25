import { isClientDemo } from "@/lib/config";

export function DemoBanner() {
  if (!isClientDemo()) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
      Client demo mode — catalogue from GitHub JSON, mocked AI, session cart/orders. No live API
      charges.
    </div>
  );
}