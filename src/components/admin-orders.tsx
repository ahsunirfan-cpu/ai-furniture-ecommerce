"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/format";

type OrderRow = {
  id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_cents: number;
  customer_name: string;
  email: string;
};

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    void fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []));
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((o) => (
          <TableRow key={o.id}>
            <TableCell>
              {o.customer_name}
              <br />
              <span className="text-xs text-stone-500">{o.email}</span>
            </TableCell>
            <TableCell>{formatPrice(o.total_cents)}</TableCell>
            <TableCell>
              {o.payment_method} / {o.payment_status}
            </TableCell>
            <TableCell>
              <Select
                defaultValue={o.status}
                onValueChange={async (status) => {
                  const res = await fetch("/api/admin/orders", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId: o.id, status }),
                  });
                  if (!res.ok) toast.error("Could not update status");
                  else toast.success("Status updated");
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}