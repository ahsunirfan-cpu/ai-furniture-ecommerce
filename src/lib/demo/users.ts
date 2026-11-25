import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import type { UserRole } from "@/lib/types";

export type DemoUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password_hash: string;
};

type AddressRow = {
  id: string;
  user_id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

let users: DemoUser[] | undefined;
const extraUsers = new Map<string, DemoUser>();
const addressesByUser = new Map<string, AddressRow[]>();

export async function loadDemoUsers(): Promise<DemoUser[]> {
  if (!users) {
    const file = path.join(process.cwd(), "data", "demo-users.json");
    users = JSON.parse(await readFile(file, "utf8")) as DemoUser[];
  }
  return [...users, ...Array.from(extraUsers.values())];
}

export async function findDemoUserByEmail(email: string): Promise<DemoUser | undefined> {
  const all = await loadDemoUsers();
  return all.find((u) => u.email === email.toLowerCase());
}

export async function verifyDemoPassword(user: DemoUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash);
}

export async function registerDemoUser(
  email: string,
  password: string,
  name: string,
): Promise<DemoUser> {
  const normalized = email.toLowerCase();
  if (await findDemoUserByEmail(normalized)) {
    throw new Error("EMAIL_EXISTS");
  }
  const password_hash = await bcrypt.hash(password, 10);
  const user: DemoUser = {
    id: randomUUID(),
    email: normalized,
    name,
    role: "USER",
    password_hash,
  };
  extraUsers.set(normalized, user);
  return user;
}

export function getDemoAddresses(userId: string): AddressRow[] {
  return addressesByUser.get(userId) ?? [];
}

export function addDemoAddress(userId: string, row: Omit<AddressRow, "id" | "user_id">): AddressRow {
  const list = addressesByUser.get(userId) ?? [];
  if (row.is_default) {
    for (const a of list) a.is_default = false;
  }
  const address: AddressRow = { ...row, id: randomUUID(), user_id: userId };
  list.push(address);
  addressesByUser.set(userId, list);
  return address;
}

export function updateDemoUserName(userId: string, name: string): void {
  const all = [...(users ?? []), ...extraUsers.values()];
  const user = all.find((u) => u.id === userId);
  if (user) user.name = name;
}