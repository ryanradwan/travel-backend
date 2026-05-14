import { createClient } from "@/lib/supabase/server";
import { chromium } from "playwright";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { content, title, clientName } = await req.json();
  if (!content) return Response.json({ error: "content required" }, { status: 400 });

  // Load brand settings
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("business_name, brand_color, brand_logo_url, brand_tagline, contact_phone, contact_email, website_url")
    .eq("user_id", user.id)
    .single();

  const p = profile as {
    business_name: string; brand_color: string | null; brand_logo_url: string | null;
    brand_tagline: string | null; contact_phone: string | null;
    contact_email: string | null; website_url: string | null;
  } | null;

  const brandColor = p?.brand_color ?? "#0E7C7B";
  const businessName = p?.business_name ?? "Travel Agency";
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Convert markdown-ish content to HTML
  const htmlContent = markdownToHtml(content);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; font-size: 13px; line-height: 1.6; }
  .page { max-width: 780px; margin: 0 auto; padding: 48px 48px 64px; }

  /* Header */
  .header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 28px; border-bottom: 3px solid ${brandColor}; margin-bottom: 32px; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand-logo { width: 52px; height: 52px; border-radius: 10px; background: ${brandColor}; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; font-weight: 700; flex-shrink: 0; overflow: hidden; }
  .brand-logo img { width: 100%; height: 100%; object-fit: contain; }
  .brand-name { font-size: 20px; font-weight: 700; color: #0B2D56; }
  .brand-tagline { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .header-meta { text-align: right; }
  .header-meta .doc-title { font-size: 18px; font-weight: 700; color: ${brandColor}; }
  .header-meta .doc-sub { font-size: 11px; color: #6b7280; margin-top: 3px; }

  /* Content */
  h1 { font-size: 20px; font-weight: 700; color: #0B2D56; margin: 28px 0 10px; }
  h2 { font-size: 15px; font-weight: 700; color: ${brandColor}; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
  h3 { font-size: 13px; font-weight: 600; color: #0B2D56; margin: 16px 0 6px; }
  p { margin-bottom: 10px; color: #374151; }
  ul, ol { margin: 8px 0 12px 18px; }
  li { margin-bottom: 4px; color: #374151; }
  strong { font-weight: 600; color: #0B2D56; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }

  /* Compliance block */
  .compliance { background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin-top: 32px; }
  .compliance p { font-size: 11px; color: #92400e; margin-bottom: 4px; }
  .compliance strong { color: #78350f; }

  /* Footer */
  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-left p { font-size: 11px; color: #9ca3af; line-height: 1.5; }
  .footer-right { text-align: right; }
  .footer-right p { font-size: 11px; color: #9ca3af; }
  .footer-right .contact { color: ${brandColor}; font-weight: 500; }

  /* Page break helpers */
  h2 { page-break-after: avoid; }
  li { page-break-inside: avoid; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">
      <div class="brand-logo">
        ${p?.brand_logo_url ? `<img src="${p.brand_logo_url}" alt="${businessName}" />` : businessName.charAt(0).toUpperCase()}
      </div>
      <div>
        <div class="brand-name">${businessName}</div>
        ${p?.brand_tagline ? `<div class="brand-tagline">${p.brand_tagline}</div>` : ""}
      </div>
    </div>
    <div class="header-meta">
      <div class="doc-title">${title ?? "Travel Proposal"}</div>
      ${clientName ? `<div class="doc-sub">Prepared for ${clientName}</div>` : ""}
      <div class="doc-sub">Date: ${today}</div>
    </div>
  </div>

  <div class="content">
    ${htmlContent}
  </div>

  <div class="footer">
    <div class="footer-left">
      <p>This proposal was prepared exclusively for ${clientName ?? "you"} by ${businessName}.</p>
      <p>All pricing is subject to availability and confirmation at time of booking.</p>
    </div>
    <div class="footer-right">
      ${p?.contact_phone ? `<p class="contact">${p.contact_phone}</p>` : ""}
      ${p?.contact_email ? `<p class="contact">${p.contact_email}</p>` : ""}
      ${p?.website_url ? `<p>${p.website_url}</p>` : ""}
    </div>
  </div>
</div>
</body>
</html>`;

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      printBackground: true,
    });
    await browser.close();

    const filename = `${(title ?? "proposal").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return Response.json({ error: "PDF generation failed. Please try again." }, { status: 500 });
  }
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^---$/gm, "<hr>")
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hul]|<hr)(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "")
    .replace(/\*\*Compliance Notes\*\*/g, "")
    .replace(/<p>(---[\s\S]*?Compliance[\s\S]*?)<\/p>/g, '<div class="compliance"><p>$1</p></div>');
}
