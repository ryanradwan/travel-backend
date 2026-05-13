import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plug, Plus, Lock, CheckCircle2, XCircle } from "lucide-react";

const PLUGIN_LIMITS: Record<string, number> = {
  starter: 3, professional: 10, agency: Infinity, enterprise: Infinity,
};

interface PageProps {
  searchParams: { error?: string; limit?: string };
}

export default async function PluginsPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [userResult, pluginsResult] = await Promise.all([
    supabase.from("users").select("subscription_tier").eq("id", user.id).single(),
    supabase.from("custom_plugins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const tier = (userResult.data as { subscription_tier: string } | null)?.subscription_tier ?? "starter";
  const plugins = (pluginsResult.data ?? []) as {
    id: string; name: string; api_base_url: string;
    permissions: string[]; status: string; created_at: string;
  }[];

  const limit = PLUGIN_LIMITS[tier] ?? 3;
  const isUnlimited = limit === Infinity;
  const atLimit = !isUnlimited && plugins.length >= limit;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Custom Plugins</h1>
          <p className="text-gray-500 text-sm mt-1">
            Connect any external API so TripDesk can call it during tasks.
            {!isUnlimited && <span className="ml-1 text-gray-400">{plugins.length} of {limit} used.</span>}
          </p>
        </div>
        {atLimit ? (
          <Link href="/dashboard/settings/billing" className="flex items-center gap-2 text-sm border border-border rounded px-4 py-2 text-gray-400 hover:text-navy transition-colors">
            <Lock size={14} />Upgrade for more
          </Link>
        ) : (
          <Link href="/dashboard/plugins/new" className="btn-teal flex items-center gap-2 text-sm px-4 py-2 rounded">
            <Plus size={16} />Add plugin
          </Link>
        )}
      </div>

      {searchParams.error === "limit" && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-700">
          You&apos;ve reached the {searchParams.limit}-plugin limit on your current plan.{" "}
          <Link href="/dashboard/settings/billing" className="underline font-medium">Upgrade to add more.</Link>
        </div>
      )}

      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold text-navy mb-1">What are custom plugins?</h3>
        <p className="text-sm text-gray-600">
          Plugins connect TripDesk to any API your business uses — your own booking system, a private hotel rate feed, a custom CRM, or any tool with an API. TripDesk can call the API during tasks and use the response in its output.
        </p>
      </div>

      {plugins.length === 0 ? (
        <div className="card text-center py-12">
          <Plug size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">No custom plugins yet</p>
          <p className="text-gray-400 text-xs mt-1 mb-4 max-w-sm mx-auto">
            Connect your own booking system, a private rate feed, or any custom API.
          </p>
          <Link href="/dashboard/plugins/new" className="btn-teal text-sm px-4 py-2 rounded inline-block">
            Add your first plugin
          </Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plugin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">API URL</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plugins.map((plugin) => (
                <tr key={plugin.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{plugin.name}</p>
                    {plugin.permissions.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">{plugin.permissions.join(", ")}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {plugin.api_base_url.replace(/^https?:\/\//, "").slice(0, 40)}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {plugin.status === "active"
                        ? <CheckCircle2 size={14} className="text-green-500" />
                        : <XCircle size={14} className="text-gray-300" />
                      }
                      <span className="text-xs text-gray-500 capitalize">{plugin.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/plugins/${plugin.id}`} className="text-xs text-teal hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
