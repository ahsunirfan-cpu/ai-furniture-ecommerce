import type { PGlite } from "@electric-sql/pglite";
import bcrypt from "bcryptjs";

type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  category: string;
  colors: string[];
  material: string;
  styleTags: string[];
  images: string[];
  stock: number;
  popularity: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
};

const PLACEHOLDER = (slug: string) =>
  `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80&sig=${slug}`;

export const PRODUCT_SEEDS: ProductSeed[] = [
  { name: "Oslo Platform Bed", slug: "oslo-platform-bed", description: "Low-profile oak platform bed with integrated nightstands.", priceCents: 89900, category: "beds", colors: ["oak", "walnut"], material: "Solid oak", styleTags: ["modern", "minimalist"], images: [PLACEHOLDER("bed1")], stock: 12, popularity: 95, widthCm: 167, depthCm: 210, heightCm: 45 },
  { name: "Linen Upholstered Bed", slug: "linen-upholstered-bed", description: "Soft linen headboard with tapered legs.", priceCents: 124900, category: "beds", colors: ["ivory", "charcoal"], material: "Linen & birch", styleTags: ["classic", "modern"], images: [PLACEHOLDER("bed2")], stock: 8, popularity: 88, widthCm: 172, depthCm: 215, heightCm: 110 },
  { name: "Compact Guest Bed Frame", slug: "compact-guest-bed", description: "Space-saving frame ideal for smaller bedrooms.", priceCents: 45900, category: "beds", colors: ["white", "grey"], material: "Engineered wood", styleTags: ["minimalist", "scandinavian"], images: [PLACEHOLDER("bed3")], stock: 20, popularity: 72, widthCm: 145, depthCm: 198, heightCm: 40 },
  { name: "Harbor Modular Sofa", slug: "harbor-modular-sofa", description: "Three-seat modular sofa with deep cushions.", priceCents: 189900, category: "sofas", colors: ["stone", "navy"], material: "Performance fabric", styleTags: ["modern", "minimalist"], images: [PLACEHOLDER("sofa1")], stock: 6, popularity: 98, widthCm: 240, depthCm: 98, heightCm: 82 },
  { name: "Velvet Curve Sofa", slug: "velvet-curve-sofa", description: "Rounded arms and rich velvet upholstery.", priceCents: 149900, category: "sofas", colors: ["emerald", "blush"], material: "Velvet", styleTags: ["classic", "art_deco"], images: [PLACEHOLDER("sofa2")], stock: 5, popularity: 85, widthCm: 210, depthCm: 95, heightCm: 78 },
  { name: "Urban Apartment Loveseat", slug: "urban-loveseat", description: "Compact loveseat for city living rooms.", priceCents: 79900, category: "sofas", colors: ["charcoal", "camel"], material: "Bouclé", styleTags: ["modern", "industrial"], images: [PLACEHOLDER("sofa3")], stock: 14, popularity: 80, widthCm: 160, depthCm: 88, heightCm: 76 },
  { name: "Atlas Dining Armchair", slug: "atlas-dining-armchair", description: "Contoured dining chair with oak legs.", priceCents: 24900, category: "chairs", colors: ["natural", "black"], material: "Oak & cane", styleTags: ["scandinavian", "modern"], images: [PLACEHOLDER("chair1")], stock: 30, popularity: 90, widthCm: 52, depthCm: 55, heightCm: 82 },
  { name: "Ergo Work Chair", slug: "ergo-work-chair", description: "Adjustable lumbar support office chair.", priceCents: 34900, category: "chairs", colors: ["black", "grey"], material: "Mesh & aluminum", styleTags: ["modern", "office"], images: [PLACEHOLDER("chair2")], stock: 25, popularity: 92, widthCm: 65, depthCm: 65, heightCm: 110 },
  { name: "Club Velvet Accent Chair", slug: "club-velvet-chair", description: "Statement accent chair for living spaces.", priceCents: 59900, category: "chairs", colors: ["forest", "mustard"], material: "Velvet", styleTags: ["classic", "mid_century"], images: [PLACEHOLDER("chair3")], stock: 11, popularity: 77, widthCm: 75, depthCm: 78, heightCm: 85 },
  { name: "Nordic Oak Dining Table", slug: "nordic-oak-dining-table", description: "Seats six comfortably with rounded edges.", priceCents: 94900, category: "tables", colors: ["natural"], material: "Solid oak", styleTags: ["scandinavian", "minimalist"], images: [PLACEHOLDER("table1")], stock: 9, popularity: 86, widthCm: 180, depthCm: 90, heightCm: 75 },
  { name: "Marble Bistro Table", slug: "marble-bistro-table", description: "Marble top with brass pedestal base.", priceCents: 69900, category: "tables", colors: ["white", "brass"], material: "Marble & brass", styleTags: ["modern", "classic"], images: [PLACEHOLDER("table2")], stock: 7, popularity: 82, widthCm: 90, depthCm: 90, heightCm: 76 },
  { name: "Slate Coffee Table", slug: "slate-coffee-table", description: "Low profile table with slate inlay.", priceCents: 42900, category: "tables", colors: ["slate", "black"], material: "Wood & slate", styleTags: ["industrial", "modern"], images: [PLACEHOLDER("table3")], stock: 16, popularity: 74, widthCm: 120, depthCm: 60, heightCm: 40 },
  { name: "Capri Wardrobe", slug: "capri-wardrobe", description: "Two-door wardrobe with internal shelving.", priceCents: 119900, category: "wardrobes", colors: ["white", "oak"], material: "MDF & oak veneer", styleTags: ["modern", "minimalist"], images: [PLACEHOLDER("ward1")], stock: 6, popularity: 70, widthCm: 120, depthCm: 58, heightCm: 200 },
  { name: "Sliding Panel Wardrobe", slug: "sliding-panel-wardrobe", description: "Sliding doors for tight bedroom layouts.", priceCents: 159900, category: "wardrobes", colors: ["graphite", "oak"], material: "Laminate", styleTags: ["modern"], images: [PLACEHOLDER("ward2")], stock: 4, popularity: 68, widthCm: 200, depthCm: 60, heightCm: 220 },
  { name: "Open Ladder Wardrobe", slug: "open-ladder-wardrobe", description: "Open hanging rail with storage shelf.", priceCents: 54900, category: "wardrobes", colors: ["black"], material: "Steel & wood", styleTags: ["industrial", "minimalist"], images: [PLACEHOLDER("ward3")], stock: 10, popularity: 65, widthCm: 100, depthCm: 45, heightCm: 185 },
  { name: "Pantry Tall Cabinet", slug: "pantry-tall-cabinet", description: "Kitchen pantry with adjustable shelves.", priceCents: 79900, category: "cabinets", colors: ["sage", "white"], material: "Painted wood", styleTags: ["classic", "farmhouse"], images: [PLACEHOLDER("cab1")], stock: 8, popularity: 71, widthCm: 80, depthCm: 40, heightCm: 190 },
  { name: "Media Console Cabinet", slug: "media-console-cabinet", description: "Cable management and soft-close doors.", priceCents: 64900, category: "cabinets", colors: ["walnut"], material: "Walnut veneer", styleTags: ["mid_century", "modern"], images: [PLACEHOLDER("cab2")], stock: 12, popularity: 83, widthCm: 180, depthCm: 42, heightCm: 55 },
  { name: "Floating Wall Cabinet", slug: "floating-wall-cabinet", description: "Wall-mounted storage for bathrooms or offices.", priceCents: 29900, category: "cabinets", colors: ["white", "oak"], material: "Oak", styleTags: ["minimalist", "scandinavian"], images: [PLACEHOLDER("cab3")], stock: 18, popularity: 66, widthCm: 90, depthCm: 30, heightCm: 70 },
  { name: "Harbor Six-Piece Dining Set", slug: "harbor-dining-set", description: "Table plus six matching upholstered chairs.", priceCents: 219900, category: "dining_sets", colors: ["oak", "stone"], material: "Oak & fabric", styleTags: ["modern", "scandinavian"], images: [PLACEHOLDER("din1")], stock: 3, popularity: 91, widthCm: 200, depthCm: 100, heightCm: 76 },
  { name: "Bistro Four-Piece Set", slug: "bistro-four-piece-set", description: "Round table with four compact chairs.", priceCents: 89900, category: "dining_sets", colors: ["white", "natural"], material: "Rubberwood", styleTags: ["classic", "minimalist"], images: [PLACEHOLDER("din2")], stock: 7, popularity: 79, widthCm: 110, depthCm: 110, heightCm: 75 },
  { name: "Executive Desk", slug: "executive-desk", description: "Wide writing surface with cable port.", priceCents: 74900, category: "office", colors: ["walnut", "black"], material: "Walnut laminate", styleTags: ["modern", "office"], images: [PLACEHOLDER("off1")], stock: 11, popularity: 87, widthCm: 140, depthCm: 70, heightCm: 75 },
  { name: "Height-Adjustable Desk", slug: "height-adjustable-desk", description: "Electric sit-stand frame with oak top.", priceCents: 99900, category: "office", colors: ["oak", "white"], material: "Oak & steel", styleTags: ["modern", "minimalist"], images: [PLACEHOLDER("off2")], stock: 9, popularity: 94, widthCm: 160, depthCm: 80, heightCm: 125 },
  { name: "Bookcase Tower", slug: "bookcase-tower", description: "Five-shelf tower for home office storage.", priceCents: 39900, category: "office", colors: ["white", "grey"], material: "Engineered wood", styleTags: ["scandinavian"], images: [PLACEHOLDER("off3")], stock: 15, popularity: 73, widthCm: 60, depthCm: 35, heightCm: 180 },
  { name: "Woven Floor Basket Set", slug: "woven-floor-basket-set", description: "Set of three natural fibre storage baskets.", priceCents: 6900, category: "decor", colors: ["natural"], material: "Seagrass", styleTags: ["bohemian", "minimalist"], images: [PLACEHOLDER("dec1")], stock: 40, popularity: 60, widthCm: 40, depthCm: 40, heightCm: 35 },
  { name: "Arc Floor Lamp", slug: "arc-floor-lamp", description: "Brushed steel arc lamp with linen shade.", priceCents: 22900, category: "decor", colors: ["brass", "linen"], material: "Steel & linen", styleTags: ["modern", "mid_century"], images: [PLACEHOLDER("dec2")], stock: 22, popularity: 81, widthCm: 40, depthCm: 150, heightCm: 190 },
  { name: "Hand-Tufted Wool Rug", slug: "hand-tufted-wool-rug", description: "Soft geometric pattern rug for living rooms.", priceCents: 34900, category: "decor", colors: ["grey", "cream"], material: "Wool", styleTags: ["modern", "scandinavian"], images: [PLACEHOLDER("dec3")], stock: 13, popularity: 76, widthCm: 200, depthCm: 300, heightCm: 2 },
];

let seeded = false;

export async function ensureSeedData(db: PGlite): Promise<void> {
  if (seeded) return;
  const existing = await db.query<{ count: string }>(
    "select count(*)::text as count from products",
  );
  if (Number(existing.rows[0]?.count ?? 0) > 0) {
    seeded = true;
    return;
  }

  const adminHash = await bcrypt.hash("admin123", 10);
  await db.query(
    `insert into users (email, password_hash, name, role)
     values ($1, $2, $3, 'ADMIN')
     on conflict (email) do nothing`,
    ["admin@roomcraft.local", adminHash, "RoomCraft Admin"],
  );

  for (const p of PRODUCT_SEEDS) {
    await db.query(
      `insert into products (
        name, slug, description, price_cents, category, colors, dimensions,
        material, style_tags, images, stock, popularity
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        p.name,
        p.slug,
        p.description,
        p.priceCents,
        p.category,
        p.colors,
        JSON.stringify({ widthCm: p.widthCm, depthCm: p.depthCm, heightCm: p.heightCm }),
        p.material,
        p.styleTags,
        p.images,
        p.stock,
        p.popularity,
      ],
    );
  }
  seeded = true;
}