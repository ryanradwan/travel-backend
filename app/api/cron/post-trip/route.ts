import { createServiceClient } from "@/lib/supabase/server";
import {
  buildPostTripCheckin,
  buildPostTripReviewRequest,
  type FollowUpContext,
} from "@/lib/email/follow-up-templates";

export const runtime = "nodejs";
export const maxDuration = 30;

// Called daily at 8am UTC by Vercel cron.
// Finds bookings where return_date was yesterday and no post-trip drafts exist yet,
// then generates a check-in draft and a review request draft.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // yesterday in YYYY-MM-DD
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  // Bookings where client returned yesterday and has an email
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, user_id, client_name, client_email, destination, travel_dates, return_date")
    .eq("return_date", yStr)
    .not("client_email", "is", null)
    .neq("client_email", "");

  if (error || !bookings) {
    return Response.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  let drafted = 0;

  for (const booking of bookings as PostTripBooking[]) {
    // Skip if we already created post-trip drafts for this booking
    const { data: existing } = await supabase
      .from("email_drafts")
      .select("id")
      .eq("booking_id", booking.id)
      .like("draft_type", "post_trip_%")
      .limit(1);

    if (existing && existing.length > 0) continue;

    // Fetch advisor's business name
    const { data: profile } = await supabase
      .from("business_profiles")
      .select("business_name")
      .eq("user_id", booking.user_id)
      .single();

    const ctx: FollowUpContext = {
      clientFirstName: booking.client_name.split(" ")[0],
      destination: booking.destination,
      travelDates: booking.travel_dates,
      businessName: (profile as { business_name: string } | null)?.business_name ?? "Your Travel Advisor",
    };

    const checkin = buildPostTripCheckin(ctx);
    const review = buildPostTripReviewRequest(ctx);

    const inserts = [
      {
        user_id: booking.user_id,
        booking_id: booking.id,
        sequence_id: null,
        draft_type: "post_trip_checkin",
        client_name: booking.client_name,
        client_email: booking.client_email,
        destination: booking.destination,
        subject: checkin.subject,
        body: checkin.body,
        status: "pending",
      },
      {
        user_id: booking.user_id,
        booking_id: booking.id,
        sequence_id: null,
        draft_type: "post_trip_review",
        client_name: booking.client_name,
        client_email: booking.client_email,
        destination: booking.destination,
        subject: review.subject,
        body: review.body,
        status: "pending",
      },
    ];

    const { error: insertErr } = await supabase.from("email_drafts").insert(inserts);
    if (!insertErr) drafted += 2;
  }

  return Response.json({ drafted });
}

interface PostTripBooking {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  destination: string;
  travel_dates: string | null;
  return_date: string;
}
