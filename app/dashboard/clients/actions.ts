"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  preferences: z.string().optional(),
  notes: z.string().optional(),
});

// Returns error string or redirects — compatible with form action type
export async function saveClient(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = {
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    nationality: formData.get("nationality") || undefined,
    preferences: formData.get("preferences") || undefined,
    notes: formData.get("notes") || undefined,
  };

  const parsed = clientSchema.safeParse(raw);
  if (!parsed.success) {
    // Validation errors: redirect back with error in search param
    redirect(`/dashboard/clients/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const clientId = formData.get("client_id") as string | null;

  if (clientId) {
    await supabase.from("clients").update({
      ...parsed.data,
      email: parsed.data.email || null,
    }).eq("id", clientId).eq("user_id", user.id);
  } else {
    await supabase.from("clients").insert({
      user_id: user.id,
      ...parsed.data,
      email: parsed.data.email || null,
    });
  }

  redirect("/dashboard/clients");
}

export async function deleteClientAction(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const clientId = formData.get("client_id") as string;
  if (!clientId) redirect("/dashboard/clients");

  await supabase.from("clients").delete().eq("id", clientId).eq("user_id", user.id);
  redirect("/dashboard/clients");
}
