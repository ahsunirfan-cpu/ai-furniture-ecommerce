import { NextResponse } from "next/server";
import { z } from "zod";
import { addToCart, getCartLines, updateCartQuantity } from "@/lib/cart/service";
import { requireUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await requireUser();
    const lines = await getCartLines(user.id);
    return NextResponse.json({ lines });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}

const addSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = addSchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    await addToCart(user.id, body.data.productId, body.data.quantity ?? 1);
    const lines = await getCartLines(user.id);
    return NextResponse.json({ lines });
  } catch (e) {
    const message = (e as Error).message;
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

const patchSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(0),
});

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = patchSchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    await updateCartQuantity(user.id, body.data.itemId, body.data.quantity);
    const lines = await getCartLines(user.id);
    return NextResponse.json({ lines });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}