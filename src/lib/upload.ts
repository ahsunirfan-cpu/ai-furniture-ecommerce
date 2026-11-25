import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/jpg"]);

export async function saveRoomImage(file: File): Promise<{ diskPath: string; publicPath: string }> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Only JPG, JPEG, and PNG files are supported.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 10MB.");
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "rooms");
  await mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  const diskPath = path.join(dir, name);
  await writeFile(diskPath, bytes);
  return { diskPath, publicPath: `/uploads/rooms/${name}` };
}