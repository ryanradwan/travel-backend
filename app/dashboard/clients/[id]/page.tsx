import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { saveClient } from "@/app/dashboard/clients/actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!client) notFound();

  const c = client as {
    id: string; name: string; email: string | null;
    phone: string | null; nationality: string | null;
    preferences: string | null; notes: string | null;
    created_at: string;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard/clients" className="text-sm text-gray-400 hover:text-navy">← Back to clients</Link>
          <h1 className="text-2xl font-bold text-navy mt-2">{c.name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">Added {formatDate(c.created_at)}</p>
        </div>
        <Link
          href={`/dashboard/chat?client=${c.id}`}
          className="btn-teal text-sm px-4 py-2 rounded"
        >
          Build itinerary →
        </Link>
      </div>

      <form action={saveClient} className="card space-y-4">
        <input type="hidden" name="client_id" value={c.id} />
        <Input label="Full name" name="name" required defaultValue={c.name} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Email" name="email" type="email" defaultValue={c.email ?? ""} />
          <Input label="Phone" name="phone" type="tel" defaultValue={c.phone ?? ""} />
        </div>
        <Input
          label="Nationality / Passport"
          name="nationality"
          defaultValue={c.nationality ?? ""}
          hint="Used for visa requirement checks"
        />
        <div>
          <label className="label">Travel preferences</label>
          <textarea
            name="preferences"
            className="input resize-none"
            rows={3}
            defaultValue={c.preferences ?? ""}
          />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea
            name="notes"
            className="input resize-none"
            rows={2}
            defaultValue={c.notes ?? ""}
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Button type="submit" variant="teal" size="md">Save changes</Button>
          <Link href={`/dashboard/clients/${c.id}/delete`}>
            <Button variant="danger" size="sm" type="button">Delete client</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
