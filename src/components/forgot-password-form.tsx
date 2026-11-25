"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: fd.get("email") }),
        });
        const data = await res.json();
        setLoading(false);
        toast.message(data.message ?? "Check your email");
      }}
    >
      <Label htmlFor="email">Email</Label>
      <Input id="email" name="email" type="email" required />
      <Button type="submit" disabled={loading} className="w-full">
        Request reset link
      </Button>
    </form>
  );
}