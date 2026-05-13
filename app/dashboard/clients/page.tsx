import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Plus, Mail, Phone, Globe } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const clientList = (clients ?? []) as {
    id: string; name: string; email: string | null;
    phone: string | null; nationality: string | null;
    preferences: string | null; notes: string | null;
    created_at: string;
  }[];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">
            {clientList.length} client{clientList.length !== 1 ? "s" : ""} in your database
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="btn-teal flex items-center gap-2 text-sm px-4 py-2 rounded"
        >
          <Plus size={16} />
          Add client
        </Link>
      </div>

      {clientList.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">No clients yet</p>
          <p className="text-gray-400 text-xs mt-1 mb-4">
            Add clients so TripDesk can personalise proposals with their preferences.
          </p>
          <Link href="/dashboard/clients/new" className="btn-teal text-sm px-4 py-2 rounded inline-block">
            Add your first client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientList.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="card hover:border-teal hover:shadow-card-hover transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold text-sm flex-shrink-0">
                  {client.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs text-gray-400">{formatDate(client.created_at)}</span>
              </div>
              <h3 className="font-semibold text-navy group-hover:text-teal transition-colors mt-2">
                {client.name}
              </h3>
              <div className="mt-2 space-y-1">
                {client.email && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail size={12} /> {client.email}
                  </p>
                )}
                {client.phone && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={12} /> {client.phone}
                  </p>
                )}
                {client.nationality && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Globe size={12} /> {client.nationality} passport
                  </p>
                )}
              </div>
              {client.preferences && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-1">{client.preferences}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
