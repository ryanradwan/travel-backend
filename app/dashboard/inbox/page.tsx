import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import InquiryCard from "@/components/inbox/InquiryCard";
import CopyLinkButton from "@/components/inbox/CopyLinkButton";

export const metadata = { title: "Inquiry Inbox — TripDesk.ai" };

interface Inquiry {
  id: string;
  source: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  inquiry_text: string;
  category: string | null;
  destination: string | null;
  travel_dates: string | null;
  budget: string | null;
  group_size: string | null;
  ai_summary: string | null;
  draft_response: string | null;
  status: string;
  created_at: string;
}

const TABS = [
  { key: "pending",   label: "Pending",   statuses: ["new", "draft_ready"] },
  { key: "responded", label: "Responded", statuses: ["responded"] },
  { key: "archived",  label: "Archived",  statuses: ["archived"] },
];

export default async function InboxPage({
  searchParams,
}: {
  searchParams: { tab?: string; error?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tab = TABS.find((t) => t.key === searchParams.tab) ?? TABS[0];

  const [inquiriesResult, profileResult] = await Promise.all([
    supabase
      .from("inquiries")
      .select("*")
      .eq("user_id", user.id)
      .in("status", tab.statuses)
      .order("created_at", { ascending: false }),
    supabase
      .from("business_profiles")
      .select("inquiry_token, business_name")
      .eq("user_id", user.id)
      .single(),
  ]);

  const inquiries = (inquiriesResult.data ?? []) as Inquiry[];
  const profile = profileResult.data as { inquiry_token: string; business_name: string } | null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const formUrl = profile ? `${appUrl}/inquiry/${profile.inquiry_token}` : null;

  // Count pending for header badge
  const { count: pendingCount } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["new", "draft_ready"]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-navy">Inquiry Inbox</h1>
          <p className="text-gray-500 text-sm mt-1">
            Client inquiries — AI triaged and ready for your response
          </p>
        </div>
        {formUrl && (
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400 border border-border rounded-lg px-3 py-2 bg-gray-50 font-mono max-w-[280px] truncate">
              {formUrl}
            </div>
            <CopyLinkButton url={formUrl} />
          </div>
        )}
      </div>

      {searchParams.error === "send_failed" && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          Failed to send the email. Check that your Resend API key is configured and try again.
        </div>
      )}

      {/* How it works callout (shown when empty) */}
      {inquiries.length === 0 && tab.key === "pending" && (
        <div className="bg-navy/5 border border-navy/10 rounded-xl p-5">
          <p className="text-sm font-semibold text-navy mb-2">How the inquiry inbox works</p>
          <ul className="text-sm text-gray-500 space-y-1.5">
            <li>· Share your unique inquiry form link with clients or embed it on your website.</li>
            <li>· When a client submits, TripDesk reads it instantly and classifies the trip type.</li>
            <li>· A personalised draft response appears here — you review, edit if needed, and send.</li>
            <li>· You can also add inquiries manually if they came in by phone or WhatsApp.</li>
          </ul>
          {formUrl && (
            <div className="mt-4 flex items-center gap-2">
              <p className="text-sm font-medium text-navy">Your form link:</p>
              <code className="text-xs bg-white border border-border rounded px-2 py-1 text-navy">{formUrl}</code>
              <CopyLinkButton url={formUrl} />
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <a
            key={t.key}
            href={`/dashboard/inbox${t.key !== "pending" ? `?tab=${t.key}` : ""}`}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${
              tab.key === t.key ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-navy"
            }`}
          >
            {t.label}
            {t.key === "pending" && (pendingCount ?? 0) > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {pendingCount}
              </span>
            )}
          </a>
        ))}
      </div>

      {/* Empty state */}
      {inquiries.length === 0 && (
        <div className="card text-center py-12">
          <Inbox size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {tab.key === "pending" ? "No pending inquiries" : `No ${tab.label.toLowerCase()} inquiries`}
          </p>
          {tab.key === "pending" && (
            <p className="text-gray-400 text-xs mt-1">
              Share your form link above to start receiving inquiries from clients.
            </p>
          )}
        </div>
      )}

      {/* Inquiry cards */}
      {inquiries.length > 0 && (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <InquiryCard key={inq.id} inquiry={inq} />
          ))}
        </div>
      )}
    </div>
  );
}
