import Link from "next/link";
import { Sofa, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Button, buttonVariants } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-stone-200 bg-[#faf8f5]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-stone-900">
          <Sofa className="h-5 w-5 text-amber-900" />
          RoomCraft
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-stone-700 md:flex">
          <Link href="/products" className="hover:text-stone-950">
            Catalogue
          </Link>
          <Link href="/room" className="inline-flex items-center gap-1 hover:text-stone-950">
            <Sparkles className="h-4 w-4 text-amber-800" />
            AI room match
          </Link>
          {user && (
            <>
              <Link href="/wishlist" className="hover:text-stone-950">
                Wishlist
              </Link>
              <Link href="/orders" className="hover:text-stone-950">
                Orders
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/cart" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Cart
          </Link>
          {user ? (
            <>
              <Link href="/account" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                {user.name || "Account"}
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className={buttonVariants({ size: "sm" })}>
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Sign in
              </Link>
              <Link href="/register" className={buttonVariants({ size: "sm" })}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}