"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const profileSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  business_type: z.string().min(1, "Select a business type"),
  location: z.string().min(2, "Enter your location"),
  target_clients: z.string().optional(),
  team_size: z.coerce.number().min(1).max(1000).default(1),
  years_in_business: z.coerce.number().min(0).max(100).default(0),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  phone: z.string().optional(),
  specialty_destinations: z.string().optional(),
});

export async function saveBusinessProfile(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const raw = {
    business_name: formData.get("business_name"),
    business_type: formData.get("business_type"),
    location: formData.get("location"),
    target_clients: formData.get("target_clients") || undefined,
    team_size: formData.get("team_size") || 1,
    years_in_business: formData.get("years_in_business") || 0,
    website: formData.get("website") || undefined,
    phone: formData.get("phone") || undefined,
    specialty_destinations: formData.get("specialty_destinations") || undefined,
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const specialtyArray = parsed.data.specialty_destinations
    ? parsed.data.specialty_destinations.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const { error } = await supabase.from("business_profiles").upsert({
    user_id: user.id,
    business_name: parsed.data.business_name,
    business_type: parsed.data.business_type,
    location: parsed.data.location,
    target_clients: parsed.data.target_clients || null,
    team_size: parsed.data.team_size,
    years_in_business: parsed.data.years_in_business,
    website: parsed.data.website || null,
    phone: parsed.data.phone || null,
    specialty_destinations: specialtyArray,
    inquiry_token: crypto.randomUUID(),
  }, { onConflict: "user_id", ignoreDuplicates: false });

  if (error) {
    return { error: "Couldn't save your profile. Please try again." };
  }

  // Fire welcome email in background — don't block redirect if it fails
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  fetch(`${appUrl}/api/email/welcome`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-key": process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    },
    body: JSON.stringify({ userId: user.id }),
  }).catch(() => {});

  redirect("/dashboard");
}
