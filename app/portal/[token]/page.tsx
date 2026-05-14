import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PortalApprovalButton from "@/components/proposals/PortalApprovalButton";

interface PageProps { params: { token: string } }

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Your Travel Proposal" };
}

export default async function ClientPortalPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*, users!proposals_user_id_fkey(id)")
    .eq("share_token", params.token)
    .single();

  if (!proposal) notFound();

  // Check expiry
  if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <p className="text-2xl mb-2">⏰</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">This link has expired</h1>
          <p className="text-gray-500 text-sm">Please contact your travel advisor for an updated proposal.</p>
        </div>
      </div>
    );
  }

  // Load advisor brand settings
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("business_name, brand_color, brand_logo_url, brand_tagline, contact_phone, contact_email, website_url")
    .eq("user_id", proposal.user_id)
    .single();

  const p = profile as {
    business_name: string; brand_color: string | null; brand_logo_url: string | null;
    brand_tagline: string | null; contact_phone: string | null;
    contact_email: string | null; website_url: string | null;
  } | null;

  const brandColor = p?.brand_color ?? "#0E7C7B";
  const businessName = p?.business_name ?? "Your Travel Advisor";

  // Mark as viewed if first time
  if (proposal.status === "sent") {
    await supabase
      .from("proposals")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("share_token", params.token);
  }

  const isApproved = proposal.status === "approved";
  const isDeclined = proposal.status === "declined";

  // Convert content to HTML
  const htmlContent = renderContent(proposal.content);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: brandColor }}
            >
              {p?.brand_logo_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={p.brand_logo_url} alt={businessName} className="w-full h-full object-contain" />
                : businessName.charAt(0).toUpperCase()
              }
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{businessName}</p>
              {p?.brand_tagline && <p className="text-xs text-gray-400">{p.brand_tagline}</p>}
            </div>
          </div>
          {(p?.contact_phone || p?.contact_email) && (
            <div className="text-right hidden sm:block">
              {p.contact_phone && <p className="text-xs font-medium" style={{ color: brandColor }}>{p.contact_phone}</p>}
              {p.contact_email && <a href={`mailto:${p.contact_email}`} className="text-xs text-gray-400 hover:underline">{p.contact_email}</a>}
            </div>
          )}
        </div>
      </header>

      {/* Proposal content */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Title block */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Your Proposal</p>
              <h1 className="text-xl font-bold text-gray-900">{proposal.title}</h1>
              <p className="text-sm text-gray-500 mt-1">Prepared for {proposal.client_name}</p>
            </div>
            {isApproved && (
              <div className="flex-shrink-0 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                ✓ Approved
              </div>
            )}
            {isDeclined && (
              <div className="flex-shrink-0 bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                Declined
              </div>
            )}
          </div>
        </div>

        {/* Proposal body */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div
            className="prose prose-sm max-w-none"
            style={{ "--brand": brandColor } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Approval section */}
        {!isApproved && !isDeclined && (
          <PortalApprovalButton token={params.token} brandColor={brandColor} clientName={proposal.client_name} />
        )}

        {isApproved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <p className="text-green-700 font-semibold text-sm">You approved this proposal on {new Date(proposal.approved_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.</p>
            <p className="text-green-600 text-xs mt-1">Your advisor has been notified and will be in touch shortly.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-xs text-gray-400">This proposal was prepared by {businessName}. Prices subject to availability at time of booking.</p>
        </div>
      </main>
    </div>
  );
}

function renderContent(content: string): string {
  return content
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-gray-800 mt-5 mb-2 pb-1 border-b border-gray-100">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-gray-700 mt-4 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^[-*] (.+)$/gm, '<li class="text-sm text-gray-600 mb-1">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul class="list-disc ml-4 my-2">${m}</ul>`)
    .replace(/^---$/gm, '<hr class="border-gray-100 my-4" />')
    .replace(/\n\n/g, '</p><p class="text-sm text-gray-600 mb-3">')
    .replace(/^(?!<[hul]|<hr|<p)(.+)$/gm, '<p class="text-sm text-gray-600 mb-3">$1</p>');
}
