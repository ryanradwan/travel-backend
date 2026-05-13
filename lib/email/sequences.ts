"use server";

import { getResend, FROM_EMAIL } from "./resend";

interface WelcomeEmailData {
  to: string;
  firstName: string;
  businessName: string;
}

// Email 1 — Sent immediately on signup
export async function sendWelcomeEmail({ to, firstName, businessName }: WelcomeEmailData) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tripdesk.ai";

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Welcome to TripDesk.ai, ${firstName}! Here's how to get started.`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: 'Inter', Arial, sans-serif; background:#F4F7FA; margin:0; padding:20px;">
<div style="max-width:560px; margin:0 auto; background:white; border-radius:12px; overflow:hidden;">

  <div style="background:#0B2D56; padding:32px; text-align:center;">
    <h1 style="color:white; margin:0; font-size:24px;">TripDesk<span style="color:#0E7C7B">.ai</span></h1>
    <p style="color:#93C5FD; margin:8px 0 0; font-size:14px;">AI-powered operations for travel businesses</p>
  </div>

  <div style="padding:32px;">
    <h2 style="color:#0B2D56; margin:0 0 16px;">Welcome, ${firstName}! 🌍</h2>
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">
      Your TripDesk.ai workspace for <strong>${businessName}</strong> is ready. You have 7 days free to explore everything — no limits.
    </p>

    <p style="color:#374151; line-height:1.6; margin:0 0 24px;">
      Here's the fastest way to see what TripDesk can do for your business:
    </p>

    <div style="background:#F4F7FA; border-radius:8px; padding:20px; margin-bottom:24px;">
      <p style="color:#0B2D56; font-weight:600; margin:0 0 12px;">Try this right now:</p>
      <p style="color:#374151; margin:0; font-size:14px; line-height:1.6;">
        Go to <strong>Client Itinerary</strong> and type a real client request — destination, dates, number of travelers. Watch TripDesk research visas, build the itinerary, write the proposal, and draft your reply email. Takes about 60 seconds.
      </p>
    </div>

    <div style="text-align:center; margin:28px 0;">
      <a href="${appUrl}/dashboard/workflows/itinerary"
         style="background:#0E7C7B; color:white; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px; display:inline-block;">
        Run your first task →
      </a>
    </div>

    <p style="color:#6B7280; font-size:13px; line-height:1.6; margin:0;">
      Questions? Just reply to this email — we read every one.
    </p>
  </div>

  <div style="padding:20px 32px; border-top:1px solid #E5E7EB;">
    <p style="color:#9CA3AF; font-size:12px; margin:0;">
      TripDesk.ai · Built for US travel businesses · <a href="${appUrl}/dashboard/settings/billing" style="color:#0E7C7B;">Manage subscription</a>
    </p>
  </div>
</div>
</body>
</html>`,
  });
}

// Email 2 — Sent on Day 3
export async function sendDay3Email({ to, firstName }: WelcomeEmailData) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tripdesk.ai";

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `What travel businesses are doing with TripDesk.ai`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#F4F7FA; margin:0; padding:20px;">
<div style="max-width:560px; margin:0 auto; background:white; border-radius:12px; padding:32px;">
  <h2 style="color:#0B2D56; margin:0 0 16px;">Hi ${firstName},</h2>
  <p style="color:#374151; line-height:1.6; margin:0 0 16px;">
    You're 3 days into your TripDesk trial. Here's how other US travel businesses are using it:
  </p>

  <div style="border-left:3px solid #0E7C7B; padding:12px 16px; margin:0 0 16px; background:#F0FDF9;">
    <p style="color:#374151; font-size:14px; margin:0;">
      <strong>"I sent 4 itinerary proposals this week using TripDesk. It used to take me 2 hours each — now it takes 10 minutes."</strong>
    </p>
    <p style="color:#6B7280; font-size:12px; margin:8px 0 0;">— Maria R., Independent Travel Advisor, Miami</p>
  </div>

  <div style="border-left:3px solid #0E7C7B; padding:12px 16px; margin:0 0 24px; background:#F0FDF9;">
    <p style="color:#374151; font-size:14px; margin:0;">
      <strong>"Our team uses the Destination Research workflow before every client call. We know visas, advisories, and pricing before we pick up the phone."</strong>
    </p>
    <p style="color:#6B7280; font-size:12px; margin:8px 0 0;">— James T., Tour Operator, Dallas</p>
  </div>

  <p style="color:#374151; line-height:1.6; margin:0 0 24px;">
    If you haven't run a full workflow yet, try the <a href="${appUrl}/dashboard/workflows/research" style="color:#0E7C7B;">Destination Research report</a> — pick a destination you send clients to regularly and see what TripDesk builds.
  </p>

  <p style="color:#6B7280; font-size:13px; margin:0;">
    Your trial ends in 4 days. <a href="${appUrl}/dashboard/settings/billing" style="color:#0E7C7B;">View plans →</a>
  </p>
</div>
</body>
</html>`,
  });
}

// Email 3 — Sent on Day 6 (trial ends tomorrow)
export async function sendTrialEndingEmail({ to, firstName }: WelcomeEmailData) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tripdesk.ai";

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your TripDesk.ai trial ends tomorrow`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#F4F7FA; margin:0; padding:20px;">
<div style="max-width:560px; margin:0 auto; background:white; border-radius:12px; padding:32px;">
  <h2 style="color:#0B2D56; margin:0 0 16px;">Hi ${firstName}, your trial ends tomorrow.</h2>
  <p style="color:#374151; line-height:1.6; margin:0 0 16px;">
    To keep access to TripDesk.ai and all your work, choose a plan before your trial ends.
  </p>

  <div style="background:#F4F7FA; border-radius:8px; padding:20px; margin-bottom:24px;">
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0; color:#374151; font-size:14px;"><strong>Starter</strong> — $29/mo</td>
        <td style="padding:8px 0; color:#6B7280; font-size:14px; text-align:right;">30 tasks/month</td>
      </tr>
      <tr>
        <td style="padding:8px 0; color:#374151; font-size:14px;"><strong>Professional</strong> — $69/mo</td>
        <td style="padding:8px 0; color:#6B7280; font-size:14px; text-align:right;">100 tasks/month</td>
      </tr>
      <tr>
        <td style="padding:8px 0; color:#374151; font-size:14px;"><strong>Agency</strong> — $109/mo</td>
        <td style="padding:8px 0; color:#6B7280; font-size:14px; text-align:right;">Unlimited</td>
      </tr>
    </table>
  </div>

  <div style="text-align:center; margin:28px 0;">
    <a href="${appUrl}/dashboard/settings/billing"
       style="background:#0E7C7B; color:white; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px; display:inline-block;">
      Choose a plan →
    </a>
  </div>

  <p style="color:#6B7280; font-size:13px; line-height:1.6; margin:0;">
    If you have any questions before committing, just reply and I'll help you pick the right plan for your business.
  </p>
</div>
</body>
</html>`,
  });
}
