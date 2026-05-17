export interface TrendDestination {
  destination: string;
  region: string;
  why_trending: string;
  sell_angle: string;
  ideal_for: string;
  avg_trip_length: string;
  best_season: string;
}

export function buildTrendReportEmail(
  trends: TrendDestination[],
  businessName: string,
  weekOf: string,
  appUrl: string
): string {
  const weekLabel = new Date(weekOf).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const destinationCards = trends.map((t, i) => `
  <div style="border:1px solid #E5E7EB;border-radius:10px;padding:20px;margin-bottom:16px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <span style="background:#0B2D56;color:white;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">#${i + 1}</span>
      <span style="background:#F3F4F6;color:#6B7280;font-size:11px;padding:3px 8px;border-radius:20px;">${t.region}</span>
    </div>
    <h3 style="color:#0B2D56;font-size:18px;font-weight:700;margin:0 0 8px;">${t.destination}</h3>
    <p style="color:#374151;font-size:13px;line-height:1.6;margin:0 0 12px;"><strong>Why it's trending:</strong> ${t.why_trending}</p>
    <div style="background:#F0FDF9;border-left:3px solid #0E7C7B;padding:10px 14px;border-radius:0 6px 6px 0;margin-bottom:12px;">
      <p style="color:#0E7C7B;font-size:13px;font-weight:600;margin:0 0 4px;">How to sell it</p>
      <p style="color:#374151;font-size:13px;line-height:1.6;margin:0;">${t.sell_angle}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
      <div style="background:#F9FAFB;border-radius:6px;padding:8px;">
        <p style="color:#9CA3AF;font-size:10px;font-weight:600;margin:0 0 2px;text-transform:uppercase;">Ideal for</p>
        <p style="color:#374151;font-size:12px;font-weight:500;margin:0;">${t.ideal_for}</p>
      </div>
      <div style="background:#F9FAFB;border-radius:6px;padding:8px;">
        <p style="color:#9CA3AF;font-size:10px;font-weight:600;margin:0 0 2px;text-transform:uppercase;">Trip length</p>
        <p style="color:#374151;font-size:12px;font-weight:500;margin:0;">${t.avg_trip_length}</p>
      </div>
      <div style="background:#F9FAFB;border-radius:6px;padding:8px;">
        <p style="color:#9CA3AF;font-size:10px;font-weight:600;margin:0 0 2px;text-transform:uppercase;">Best season</p>
        <p style="color:#374151;font-size:12px;font-weight:500;margin:0;">${t.best_season}</p>
      </div>
    </div>
  </div>`).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Inter',Arial,sans-serif;background:#F4F7FA;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;">

  <div style="background:#0B2D56;padding:32px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">TravelBackend<span style="color:#0E7C7B">.ai</span></h1>
    <p style="color:#93C5FD;margin:6px 0 0;font-size:13px;">Weekly Destination Trend Report</p>
  </div>

  <div style="padding:32px;">
    <p style="color:#6B7280;font-size:13px;margin:0 0 6px;">Week of ${weekLabel}</p>
    <h2 style="color:#0B2D56;font-size:20px;font-weight:700;margin:0 0 6px;">5 Destinations Trending Right Now</h2>
    <p style="color:#6B7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Personalised for <strong>${businessName}</strong> — here's what's gaining momentum this week and how to position each one with your clients.
    </p>

    ${destinationCards}

    <div style="text-align:center;margin:28px 0 16px;">
      <a href="${appUrl}/dashboard/trends"
         style="background:#0E7C7B;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
        View full report in TravelBackend →
      </a>
    </div>
  </div>

  <div style="background:#F4F7FA;padding:16px 32px;border-top:1px solid #E5E7EB;text-align:center;">
    <p style="color:#9CA3AF;font-size:12px;margin:0;">
      Sent every Monday by <a href="https://travelbackend.com" style="color:#0E7C7B;text-decoration:none;">TravelBackend.com</a>
    </p>
  </div>
</div>
</body>
</html>`;
}
