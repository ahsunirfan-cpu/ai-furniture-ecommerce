export type UserRole = "USER" | "ADMIN";

export type ProductCategory =
  | "beds"
  | "sofas"
  | "chairs"
  | "tables"
  | "wardrobes"
  | "cabinets"
  | "dining_sets"
  | "office"
  | "decor";

export type RoomType = "bedroom" | "living_room" | "dining_room" | "office" | "kitchen";

export type RoomAnalysisResult = {
  colorPalette: string[];
  interiorStyle: string;
  detectedFurniture: string[];
  freeSpaceEstimate: "small" | "medium" | "large";
  confidence: "low" | "medium" | "high";
  userFacingSummary: string;
  measurementDisclaimer: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  category: ProductCategory;
  colors: string[];
  dimensions: { widthCm: number; depthCm: number; heightCm: number };
  material: string;
  style_tags: string[];
  images: string[];
  stock: number;
  popularity: number;
  created_at: string;
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  beds: "Beds",
  sofas: "Sofas",
  chairs: "Chairs",
  tables: "Tables",
  wardrobes: "Wardrobes",
  cabinets: "Cabinets",
  dining_sets: "Dining sets",
  office: "Office furniture",
  decor: "Home décor",
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  bedroom: "Bedroom",
  living_room: "Living room",
  dining_room: "Dining room",
  office: "Office",
  kitchen: "Kitchen",
};

export type CartLine = {
  id: string;
  product_id: string;
  quantity: number;
  name: string;
  slug: string;
  price_cents: number;
  image: string;
  stock: number;
};

export const ROOM_CATEGORY_MAP: Record<RoomType, ProductCategory[]> = {
  bedroom: ["beds", "wardrobes", "cabinets", "decor", "chairs"],
  living_room: ["sofas", "chairs", "tables", "cabinets", "decor"],
  dining_room: ["dining_sets", "tables", "chairs", "cabinets", "decor"],
  office: ["office", "chairs", "cabinets", "tables", "decor"],
  kitchen: ["cabinets", "tables", "chairs", "decor"],
};