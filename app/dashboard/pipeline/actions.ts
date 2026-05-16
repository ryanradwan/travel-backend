"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const bookingSchema = z.object({
  client_name: z.string().min(1),
  client_email: z.string().email().optional().or(z.literal("")),
  destination: z.string().min(1),
  travel_dates: z.string().optional(),
  return_date: z.string().optional().or(z.literal("")),
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
    return_date: formData.get("return_date") || "",
    gross_value: formData.get("gross_value") || 0,
    commission_pct: formData.get("commission_pct") || 10,
    status: formData.get("status") || "proposal_sent",
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) redirect("/dashboard/pipeline?error=" + encodeURIComponent(parsed.error.issues[0].message));

  // Stamp confirmed_at when first moving to confirmed/completed; preserve existing value
  let confirmedAt: string | null = null;
  const isWon = ["confirmed", "completed"].includes(parsed.data.status);
  if (isWon) {
    if (bookingId) {
      const { data: existing } = await supabase
        .from("bookings")
        .select("confirmed_at")
        .eq("id", bookingId)
        .single();
      confirmedAt = (existing as { confirmed_at: string | null } | null)?.confirmed_at ?? new Date().toISOString();
    } else {
      confirmedAt = new Date().toISOString();
    }
  }

  const payload = {
    client_name: parsed.data.client_name,
    client_email: parsed.data.client_email || null,
    destination: parsed.data.destination,
    travel_dates: parsed.data.travel_dates || null,
    return_date: parsed.data.return_date || null,
    gross_value: parsed.data.gross_value,
    commission_pct: parsed.data.commission_pct,
    status: parsed.data.status,
    notes: parsed.data.notes || null,
    ...(isWon && { confirmed_at: confirmedAt }),
  };

  let savedBookingId = bookingId;

  if (bookingId) {
    await supabase.from("bookings").update(payload).eq("id", bookingId).eq("user_id", user.id);
  } else {
    const { data: inserted } = await supabase
      .from("bookings")
      .insert({ ...payload, user_id: user.id })
      .select("id")
      .single();
    savedBookingId = (inserted as { id: string } | null)?.id ?? null;
  }

  // Auto-create a follow-up sequence when status is proposal_sent and client has an email
  if (
    parsed.data.status === "proposal_sent" &&
    parsed.data.client_email &&
    savedBookingId
  ) {
    await supabase.from("follow_up_sequences").upsert(
      {
        user_id: user.id,
        booking_id: savedBookingId,
        client_name: parsed.data.client_name,
        client_email: parsed.data.client_email,
        destination: parsed.data.destination,
        proposal_sent_at: new Date().toISOString(),
        status: "active",
      },
      { onConflict: "booking_id", ignoreDuplicates: true }
    );
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
