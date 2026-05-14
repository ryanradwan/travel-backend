"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const bookingSchema = z.object({
  client_name: z.string().min(1),
  client_email: z.string().email().optional().or(z.literal("")),
  destination: z.string().min(1),
  travel_dates: z.string().optional(),
  gross_value: z.coerce.number().min(0).default(0),
  commission_pct: z.coerce.number().min(0).max(100).default(10),
  status: z.enum(["proposal_sent", "follow_up", "approved", "confirmed", "completed", "cancelled"]).default("proposal_sent"),
  notes: z.string().optional(),
});

export async function saveBooking(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const bookingId = formData.get("booking_id") as string | null;

  const parsed = bookingSchema.safeParse({
    client_name: formData.get("client_name"),
    client_email: formData.get("client_email") || "",
    destination: formData.get("destination"),
    travel_dates: formData.get("travel_dates") || "",
    gross_value: formData.get("gross_value") || 0,
    commission_pct: formData.get("commission_pct") || 10,
    status: formData.get("status") || "proposal_sent",
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) redirect("/dashboard/pipeline?error=" + encodeURIComponent(parsed.error.issues[0].message));

  const payload = {
    client_name: parsed.data.client_name,
    client_email: parsed.data.client_email || null,
    destination: parsed.data.destination,
    travel_dates: parsed.data.travel_dates || null,
    gross_value: parsed.data.gross_value,
    commission_pct: parsed.data.commission_pct,
    status: parsed.data.status,
    notes: parsed.data.notes || null,
  };

  if (bookingId) {
    await supabase.from("bookings").update(payload).eq("id", bookingId).eq("user_id", user.id);
  } else {
    await supabase.from("bookings").insert({ ...payload, user_id: user.id });
  }

  redirect("/dashboard/pipeline");
}

export async function deleteBooking(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const bookingId = formData.get("booking_id") as string;
  if (bookingId) await supabase.from("bookings").delete().eq("id", bookingId).eq("user_id", user.id);

  redirect("/dashboard/pipeline");
}
