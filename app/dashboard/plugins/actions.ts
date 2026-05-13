"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const PLUGIN_LIMITS: Record<string, number> = {
  starter: 3,
  professional: 10,
  agency: Infinity,
  enterprise: Infinity,
};

const pluginSchema = z.object({
  name: z.string().min(2).max(50),
  api_base_url: z.string().url("Enter a valid API URL"),
  api_key: z.string().optional(),
  description: z.string().optional(),
  permissions: z.string().optional(),
});

async function checkPluginLimit(userId: string): Promise<{ allowed: boolean; limit: number }> {
  const supabase = createClient();

  const [userResult, countResult] = await Promise.all([
    supabase.from("users").select("subscription_tier").eq("id", userId).single(),
    supabase.from("custom_plugins").select("id", { count: "exact" }).eq("user_id", userId),
  ]);

  const tier = (userResult.data as { subscription_tier: string } | null)?.subscription_tier ?? "starter";
  const used = countResult.count ?? 0;
  const limit = PLUGIN_LIMITS[tier] ?? 3;

  return { allowed: limit === Infinity || used < limit, limit };
}

export async function savePlugin(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const pluginId = formData.get("plugin_id") as string | null;

  if (!pluginId) {
    const { allowed, limit } = await checkPluginLimit(user.id);
    if (!allowed) redirect(`/dashboard/plugins?error=limit&limit=${limit}`);
  }

  const raw = {
    name: formData.get("name"),
    api_base_url: formData.get("api_base_url"),
    api_key: formData.get("api_key") || undefined,
    description: formData.get("description") || undefined,
    permissions: formData.get("permissions") || undefined,
  };

  const parsed = pluginSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/dashboard/plugins/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const permissions = parsed.data.permissions
    ? parsed.data.permissions.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  // Encrypt the API key (base64 for now — use Supabase Vault in production)
  const encryptedKey = parsed.data.api_key
    ? Buffer.from(parsed.data.api_key).toString("base64")
    : null;

  if (pluginId) {
    await supabase.from("custom_plugins").update({
      name: parsed.data.name,
      api_base_url: parsed.data.api_base_url,
      api_credentials_encrypted: encryptedKey,
      permissions,
    }).eq("id", pluginId).eq("user_id", user.id);
  } else {
    await supabase.from("custom_plugins").insert({
      user_id: user.id,
      name: parsed.data.name,
      api_base_url: parsed.data.api_base_url,
      api_credentials_encrypted: encryptedKey,
      permissions,
      status: "active",
    });
  }

  redirect("/dashboard/plugins");
}

export async function deletePlugin(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const pluginId = formData.get("plugin_id") as string;
  if (!pluginId) redirect("/dashboard/plugins");

  await supabase.from("custom_plugins").delete().eq("id", pluginId).eq("user_id", user.id);
  redirect("/dashboard/plugins");
}
