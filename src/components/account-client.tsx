"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Address = {
  id: string;
  label: string;
  line1: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

export function AccountClient({
  user,
  addresses: initialAddresses,
}: {
  user: { name: string; email: string };
  addresses: Address[];
}) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [name, setName] = useState(user.name);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="text-sm text-stone-600">{user.email}</p>
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button
          onClick={async () => {
            const res = await fetch("/api/account", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name }),
            });
            if (!res.ok) toast.error("Could not update profile");
            else toast.success("Profile saved");
          }}
        >
          Save profile
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
            router.refresh();
          }}
        >
          Sign out
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Delivery addresses</h2>
        <ul className="space-y-2 text-sm">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-md bg-stone-50 p-3">
              <strong>{a.label}</strong>
              {a.is_default && " (default)"}
              <br />
              {a.line1}, {a.city} {a.postal_code}
            </li>
          ))}
        </ul>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const res = await fetch("/api/account", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                label: fd.get("label"),
                line1: fd.get("line1"),
                city: fd.get("city"),
                postal_code: fd.get("postal_code"),
                country: fd.get("country"),
                is_default: fd.get("is_default") === "on",
              }),
            });
            const data = await res.json();
            if (!res.ok) {
              toast.error(data.error ?? "Could not add address");
              return;
            }
            setAddresses((prev) => [...prev, data.address]);
            toast.success("Address added");
            e.currentTarget.reset();
          }}
        >
          <Input name="label" placeholder="Label" defaultValue="Home" required />
          <Input name="line1" placeholder="Street address" required />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input name="city" placeholder="City" required />
            <Input name="postal_code" placeholder="Postcode" required />
          </div>
          <Input name="country" placeholder="Country" defaultValue="United Kingdom" required />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_default" /> Default address
          </label>
          <Button type="submit">Add address</Button>
        </form>
      </section>
    </div>
  );
}