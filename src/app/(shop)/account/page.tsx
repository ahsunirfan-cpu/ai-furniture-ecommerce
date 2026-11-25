import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { AccountClient } from "@/components/account-client";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const addresses = await sql(
    "select id, label, line1, city, postal_code, country, is_default from addresses where user_id = $1",
    [user.id],
  );
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Account</h1>
      <AccountClient user={{ name: user.name, email: user.email }} addresses={addresses as never} />
    </div>
  );
}