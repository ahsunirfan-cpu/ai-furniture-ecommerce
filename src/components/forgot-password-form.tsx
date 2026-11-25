"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
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
          if (data.demoResetToken) setToken(data.demoResetToken);
        }}
      >
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
        <Button type="submit" disabled={loading} className="w-full">
          Send reset link
        </Button>
      </form>

      {token && (
        <form
          className="space-y-3 rounded-lg border bg-stone-50 p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const fd = new FormData(e.currentTarget);
            const res = await fetch("/api/auth/reset-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, password: fd.get("password") }),
            });
            const data = await res.json();
            setLoading(false);
            if (!res.ok) {
              toast.error(data.error ?? "Reset failed");
              return;
            }
            toast.success("Password updated — you can sign in now.");
          }}
        >
          <p className="text-sm text-stone-600">
            Demo token (in production this would be emailed):
          </p>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
          <Button type="submit" disabled={loading}>
            Set new password
          </Button>
        </form>
      )}
    </div>
  );
}