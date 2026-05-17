import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Mail, CheckCircle2 } from "lucide-react";
import DraftCard from "@/components/follow-ups/DraftCard";

export const metadata = { title: "Follow-Ups — TravelBackend.com" };

interface Draft {
  id: string;
  draft_type: string;
  client_name: string;
  client_email: string;
  destination: string | null;
  subject: string;
  body: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

const SECTION_ORDER = [
  "follow_up_day3",
  "follow_up_day7",
  "follow_up_day14",
  "post_trip_checkin",
  "post_trip_review",
];

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: { tab?: string; error?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tab = searchParams.tab === "sent" ? "sent" : "pending";

  const { data: drafts } = await supabase
    .from("email_drafts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", tab === "sent" ? "sent" : "pending")
    .order("created_at", { ascending: false });

  const list = (drafts ?? []) as Draft[];

  // Group pending drafts by type for ordered rendering
  const grouped = SECTION_ORDER.reduce<Record<string, Draft[]>>((acc, type) => {
    acc[type] = list.filter((d) => d.draft_type === type);
    return acc;
  }, {});

  const pendingCount = list.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Follow-Ups</h1>
          <p className="text-gray-500 text-sm mt-1">
            AI-drafted emails waiting for your approval before sending to clients
          </p>
        </div>
        {tab === "pending" && pendingCount > 0 && (
          <span className="bg-teal text-white text-sm font-semibold px-3 py-1 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      {searchParams.error === "send_failed" && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          Failed to send the email. Check that your Resend API key is configured and try again.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <a
          href="/dashboard/follow-ups"
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
            tab === "pending" ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-navy"
          }`}
        >
          Pending
        </a>
        <a
          href="/dashboard/follow-ups?tab=sent"
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
            tab === "sent" ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-navy"
          }`}
        >
          Sent
        </a>
      </div>

      {/* Empty state */}
      {list.length === 0 && (
        <div className="card text-center py-14">
          {tab === "pending" ? (
            <>
              <CheckCircle2 size={36} className="text-teal mx-auto mb-3" />
              <p className="text-navy font-semibold">All caught up</p>
              <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
                No follow-up emails waiting for approval. TravelBackend will automatically draft new ones when proposals are sent or clients return from trips.
              </p>
            </>
          ) : (
            <>
              <Mail size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No sent emails yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Approved follow-ups will appear here.
              </p>
            </>
          )}
        </div>
      )}

      {/* Pending drafts — grouped by type */}
      {tab === "pending" && list.length > 0 && (
        <div className="space-y-8">
          {SECTION_ORDER.map((type) => {
            const items = grouped[type];
            if (!items || items.length === 0) return null;
            return (
              <section key={type}>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {SECTION_TITLES[type]}
                </h2>
                <div className="space-y-4">
                  {items.map((draft) => (
                    <DraftCard key={draft.id} draft={draft} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Sent history — flat list */}
      {tab === "sent" && list.length > 0 && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Subject</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-navy">{d.client_name}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{d.subject}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">
                    {d.draft_type.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {d.sent_at
                      ? new Date(d.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* How it works callout */}
      <div className="bg-navy/5 border border-navy/10 rounded-xl p-5">
        <p className="text-sm font-semibold text-navy mb-2">How automated follow-ups work</p>
        <ul className="text-sm text-gray-500 space-y-1.5">
          <li>· When you add a booking with status <strong>Proposal Sent</strong>, TravelBackend starts a follow-up sequence.</li>
          <li>· Draft emails appear here at <strong>Day 3</strong>, <strong>Day 7</strong>, and <strong>Day 14</strong> if the client has not responded.</li>
          <li>· Set a <strong>return date</strong> on a booking to automatically receive a post-trip check-in and review request the next day.</li>
          <li>· Every email is a draft — you review and approve before anything is sent.</li>
        </ul>
      </div>
    </div>
  );
}

const SECTION_TITLES: Record<string, string> = {
  follow_up_day3:    "Day 3 — Proposal Follow-Ups",
  follow_up_day7:    "Day 7 — Follow-Ups",
  follow_up_day14:   "Day 14 — Final Follow-Ups",
  post_trip_checkin: "Post-Trip Check-Ins",
  post_trip_review:  "Review Requests",
};
