"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/format";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  stock: number;
  category: string;
};

export function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    if (res.ok) setProducts(data.products);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <form
        className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const res = await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: fd.get("name"),
              description: fd.get("description"),
              price_cents: Math.round(Number(fd.get("price")) * 100),
              category: fd.get("category"),
              colors: String(fd.get("colors")).split(",").map((s) => s.trim()).filter(Boolean),
              material: fd.get("material"),
              style_tags: String(fd.get("styles")).split(",").map((s) => s.trim()).filter(Boolean),
              images: [String(fd.get("image"))],
              stock: Number(fd.get("stock")),
              widthCm: Number(fd.get("width")),
              depthCm: Number(fd.get("depth")),
              heightCm: Number(fd.get("height")),
            }),
          });
          if (!res.ok) {
            toast.error("Could not create product");
            return;
          }
          toast.success("Product added");
          e.currentTarget.reset();
          await load();
        }}
      >
        <Input name="name" placeholder="Product name" required />
        <Input name="price" placeholder="Price (£)" type="number" step="0.01" required />
        <Input name="category" placeholder="Category (e.g. sofas)" required />
        <Input name="description" placeholder="Description" className="md:col-span-3" required />
        <Input name="material" placeholder="Material" />
        <Input name="colors" placeholder="Colours (comma-separated)" />
        <Input name="styles" placeholder="Styles (comma-separated)" />
        <Input name="stock" placeholder="Stock" type="number" defaultValue={5} />
        <Input name="image" placeholder="Image URL" className="md:col-span-2" />
        <div className="flex gap-2">
          <Input name="width" placeholder="W cm" type="number" defaultValue={100} />
          <Input name="depth" placeholder="D cm" type="number" defaultValue={50} />
          <Input name="height" placeholder="H cm" type="number" defaultValue={80} />
        </div>
        <Button type="submit">Add product</Button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{formatPrice(p.price_cents)}</TableCell>
                <TableCell>
                  <Input
                    className="w-20"
                    type="number"
                    defaultValue={p.stock}
                    onBlur={async (e) => {
                      const stock = Number(e.target.value);
                      const res = await fetch("/api/admin/products/stock", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: p.id, stock }),
                      });
                      if (!res.ok) toast.error("Update failed");
                      else toast.success("Stock updated");
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      const res = await fetch(`/api/admin/products?id=${p.id}`, { method: "DELETE" });
                      if (!res.ok) toast.error("Delete failed");
                      else {
                        toast.success("Deleted");
                        await load();
                      }
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}