import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-stone-200 py-6 text-center text-sm text-stone-600">
        RoomCraft · AI recommendations are estimates · Phase 2 visualization coming soon
      </footer>
    </>
  );
}