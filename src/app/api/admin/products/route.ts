import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { sql, sqlOne } from "@/lib/db";
import { slugify } from "@/lib/format";

export async function GET() {
  try {
    await requireAdmin();
    const products = await sql("select * from products order by created_at desc");
    return NextResponse.json({ products });
  } catch (e) {
    const msg = (e as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === "FORBIDDEN" ? 403 : 401 });
  }
}

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string(),
  price_cents: z.number().int().min(0),
  category: z.string(),
  colors: z.array(z.string()),
  material: z.string(),
  style_tags: z.array(z.string()),
  images: z.array(z.string()),
  stock: z.number().int().min(0),
  popularity: z.number().int().min(0).optional(),
  widthCm: z.number(),
  depthCm: z.number(),
  heightCm: z.number(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = productSchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    }
    const slug = slugify(body.data.name);
    const product = await sqlOne(
      `insert into products (
        name, slug, description, price_cents, category, colors, dimensions, material,
        style_tags, images, stock, popularity
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning *`,
      [
        body.data.name,
        slug,
        body.data.description,
        body.data.price_cents,
        body.data.category,
        body.data.colors,
        JSON.stringify({
          widthCm: body.data.widthCm,
          depthCm: body.data.depthCm,
          heightCm: body.data.heightCm,
        }),
        body.data.material,
        body.data.style_tags,
        body.data.images,
        body.data.stock,
        body.data.popularity ?? 50,
      ],
    );
    return NextResponse.json({ product });
  } catch (e) {
    const msg = (e as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === "FORBIDDEN" ? 403 : 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = productSchema.extend({ id: z.string().uuid() }).safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    }
    const product = await sqlOne(
      `update products set
        name=$2, description=$3, price_cents=$4, category=$5, colors=$6,
        dimensions=$7, material=$8, style_tags=$9, images=$10, stock=$11, popularity=$12
       where id=$1 returning *`,
      [
        body.data.id,
        body.data.name,
        body.data.description,
        body.data.price_cents,
        body.data.category,
        body.data.colors,
        JSON.stringify({
          widthCm: body.data.widthCm,
          depthCm: body.data.depthCm,
          heightCm: body.data.heightCm,
        }),
        body.data.material,
        body.data.style_tags,
        body.data.images,
        body.data.stock,
        body.data.popularity ?? 50,
      ],
    );
    return NextResponse.json({ product });
  } catch (e) {
    const msg = (e as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === "FORBIDDEN" ? 403 : 401 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id." }, { status: 400 });
    }
    await sql("delete from products where id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = (e as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === "FORBIDDEN" ? 403 : 401 });
  }
}