import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { listProducts } from "@/lib/products/queries";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const featured = await listProducts({ sort: "popular" });
  const top = featured.slice(0, 3);

  return (
    <div className="space-y-14">
      <section className="grid items-center gap-10 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 px-6 py-12 text-stone-50 md:grid-cols-2 md:px-10">
        <div className="space-y-5">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-200/90">AI-powered shopping</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Furniture that fits your room—not just your wishlist
          </h1>
          <p className="max-w-lg text-stone-200">
            Upload a photo of your space. We analyse colours, style, and layout, then recommend real
            pieces from our catalogue with clear explanations you can buy today.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/room" className={buttonVariants({ size: "lg" })}>
              <Sparkles className="mr-2 h-4 w-4" />
              Start room analysis
            </Link>
            <Link href="/products" className={buttonVariants({ size: "lg", variant: "secondary" })}>
              Browse catalogue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
            alt="Modern living room"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">Popular this week</h2>
          <Link href="/products" className="text-sm text-amber-900 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}