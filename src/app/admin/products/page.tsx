import { AdminProducts } from "@/components/admin-products";

export default function AdminProductsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Products</h1>
      <AdminProducts />
    </div>
  );
}