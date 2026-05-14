"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const brandSchema = z.object({
  brand_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex colour").default("#0E7C7B"),
  brand_logo_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  brand_tagline: z.string().max(100).optional(),
  contact_phone: z.string().max(30).optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export async function saveBrandSettings(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = {
    brand_color: formData.get("brand_color") || "#0E7C7B",
    brand_logo_url: formData.get("brand_logo_url") || "",
    brand_tagline: formData.get("brand_tagline") || "",
    contact_phone: formData.get("contact_phone") || "",
    contact_email: formData.get("contact_email") || "",
    website_url: formData.get("website_url") || "",
  };

  const parsed = brandSchema.safeParse(raw);
  if (!parsed.success) redirect("/dashboard/settings/brand?error=" + encodeURIComponent(parsed.error.issues[0].message));

  await supabase.from("business_profiles").update({
    brand_color: parsed.data.brand_color,
    brand_logo_url: parsed.data.brand_logo_url || null,
    brand_tagline: parsed.data.brand_tagline || null,
    contact_phone: parsed.data.contact_phone || null,
    contact_email: parsed.data.contact_email || null,
    website_url: parsed.data.website_url || null,
  }).eq("user_id", user.id);

  redirect("/dashboard/settings/brand?saved=1");
}
