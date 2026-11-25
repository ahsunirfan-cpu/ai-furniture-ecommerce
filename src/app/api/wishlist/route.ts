import { NextResponse } from "next/server";
import { z } from "zod";
import { listWishlist, toggleWishlist } from "@/lib/wishlist/service";
import { requireUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await requireUser();
    const items = await listWishlist(user.id);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}

const schema = z.object({ productId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = schema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const saved = await toggleWishlist(user.id, body.data.productId);
    return NextResponse.json({ saved });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}