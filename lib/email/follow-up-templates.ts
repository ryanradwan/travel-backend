// Plain-text email bodies for proposal follow-ups and post-trip messages.
// Stored as plain text in the DB so advisors can read/edit before sending.
// The approve action wraps them in branded HTML before sending via Resend.

export interface FollowUpContext {
  clientFirstName: string;
  destination: string;
  travelDates?: string | null;
  businessName: string;
  advisorName?: string | null;
}

export function buildDay3FollowUp(ctx: FollowUpContext): { subject: string; body: string } {
  return {
    subject: `Following up on your ${ctx.destination} itinerary, ${ctx.clientFirstName}`,
    body: `Hi ${ctx.clientFirstName},

I just wanted to make sure the ${ctx.destination} proposal landed in your inbox okay${ctx.travelDates ? ` for ${ctx.travelDates}` : ""}.

If you have any questions, want to tweak the itinerary, or need a different budget range, just say the word — I'm happy to adjust anything.

Looking forward to helping make this trip happen!

Warm regards,
${ctx.advisorName ?? ctx.businessName}`,
  };
}

export function buildDay7FollowUp(ctx: FollowUpContext): { subject: string; body: string } {
  return {
    subject: `Still thinking about ${ctx.destination}? Happy to adjust the plan`,
    body: `Hi ${ctx.clientFirstName},

It's been about a week since I sent over the ${ctx.destination} proposal and I wanted to check in. No pressure at all — I know these decisions take time.

If anything in the itinerary felt off — the pacing, the hotels, the activities — I can rework it quickly. Sometimes seeing a revised version makes the decision much easier.

Just let me know what's on your mind and I'll take it from there.

Best,
${ctx.advisorName ?? ctx.businessName}`,
  };
}

export function buildDay14FollowUp(ctx: FollowUpContext): { subject: string; body: string } {
  return {
    subject: `One last note on your ${ctx.destination} trip`,
    body: `Hi ${ctx.clientFirstName},

I don't want to overload your inbox, so this will be my last follow-up on the ${ctx.destination} proposal.

A quick heads-up: availability and pricing for this kind of trip${ctx.travelDates ? ` in ${ctx.travelDates}` : ""} can move quickly, especially for the hotels and experiences I've recommended.

If you'd like to move forward — or even just chat through it — I'm here. And if the timing isn't right, no worries at all. I'll be here whenever you're ready.

Best wishes,
${ctx.advisorName ?? ctx.businessName}`,
  };
}

export function buildPostTripCheckin(ctx: FollowUpContext): { subject: string; body: string } {
  return {
    subject: `How was ${ctx.destination}, ${ctx.clientFirstName}?`,
    body: `Hi ${ctx.clientFirstName},

Welcome back! I hope ${ctx.destination} was everything you hoped for and more.

I'd love to hear how it went — the highlights, any surprises, and whether there was anything that could have been better. Your feedback genuinely helps me plan even better trips for you next time.

And whenever the travel bug strikes again, I'm here. Whether it's somewhere completely new or a return to a favourite place, let's start planning!

Warmly,
${ctx.advisorName ?? ctx.businessName}`,
  };
}

export function buildPostTripReviewRequest(ctx: FollowUpContext): { subject: string; body: string } {
  return {
    subject: `Would you leave us a quick review, ${ctx.clientFirstName}?`,
    body: `Hi ${ctx.clientFirstName},

I hope you're settling back in after ${ctx.destination}!

If you had a great experience working with us, I'd be really grateful if you could take 2 minutes to leave a Google review. Reviews mean everything to a small travel business — they help other travellers find us and trust us with their trips.

You can leave a review here: [paste your Google Business link]

Thank you so much — it genuinely makes a difference.

With gratitude,
${ctx.advisorName ?? ctx.businessName}`,
  };
}

// Wraps a plain-text body in branded HTML for sending via Resend
export function wrapInEmailHtml(body: string, subject: string, businessName: string): string {
  const paragraphs = body
    .split("\n\n")
    .map((p) => `<p style="color:#374151; line-height:1.7; margin:0 0 16px; font-size:15px;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Inter',Arial,sans-serif;background:#F4F7FA;margin:0;padding:20px;">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;">
  <div style="background:#0B2D56;padding:24px 32px;">
    <p style="color:white;margin:0;font-size:13px;font-weight:600;letter-spacing:0.5px;">${businessName}</p>
  </div>
  <div style="padding:32px;">
    ${paragraphs}
  </div>
  <div style="background:#F4F7FA;padding:16px 32px;border-top:1px solid #E5E7EB;">
    <p style="color:#9CA3AF;font-size:12px;margin:0;">
      Sent via <a href="https://tripdesk.ai" style="color:#0E7C7B;text-decoration:none;">TripDesk.ai</a>
    </p>
  </div>
</div>
</body>
</html>`;
}
