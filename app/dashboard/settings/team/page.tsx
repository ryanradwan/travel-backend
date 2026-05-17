import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Lock } from "lucide-react";

const SEAT_LIMITS: Record<string, number> = {
  starter: 1,
  professional: 5,
  agency: Infinity,
  enterprise: Infinity,
};

export default async function TeamSettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const tier = (userData as { subscription_tier: string } | null)?.subscription_tier ?? "starter";
  const seatLimit = SEAT_LIMITS[tier] ?? 1;
  const isMultiSeat = seatLimit > 1;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Team Members</h2>
        <p className="text-gray-500 text-sm mt-1">
          Invite team members to collaborate on your TripDesk workspace.
        </p>
      </div>

      {!isMultiSeat ? (
        /* Starter — single seat, show upgrade prompt */
        <div className="card border-2 border-dashed border-border text-center py-12">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-gray-400" />
          </div>
          <h3 className="text-base font-bold text-navy mb-2">Team seats not available on Starter</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-5">
            Upgrade to Professional to add up to 5 team members, or Agency for unlimited seats.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/dashboard/settings/billing"
              className="btn-teal px-6 py-2.5 rounded text-sm font-semibold inline-block"
            >
              Upgrade to Professional — $59/mo
            </a>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
            {[
              { plan: "Professional", seats: "5 seats", price: "$59/mo" },
              { plan: "Agency", seats: "Unlimited seats", price: "$89/mo" },
            ].map(({ plan, seats, price }) => (
              <div key={plan} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-bold text-navy">{plan}</p>
                <p className="text-xs text-teal font-medium mt-1">{seats}</p>
                <p className="text-xs text-gray-400 mt-0.5">{price}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Professional / Agency — show team management */
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-navy" />
                <h3 className="text-sm font-semibold text-navy">
                  Your Team
                  {seatLimit !== Infinity && (
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      1 of {seatLimit} seats used
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {/* Owner row */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center">
                  <span className="text-teal text-xs font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">{user.email}</p>
                  <p className="text-xs text-gray-400">Account owner</p>
                </div>
              </div>
              <span className="text-xs bg-teal/10 text-teal px-2 py-0.5 rounded-full font-medium">
                Owner
              </span>
            </div>

            {/* Invite prompt */}
            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-3">
                Team member invitations will be available in the next update. For now, contact{" "}
                <a href="mailto:support@tripdesk.ai" className="text-teal hover:underline">
                  support@tripdesk.ai
                </a>{" "}
                to add team members to your account.
              </p>
              <div className="bg-teal/5 border border-teal/20 rounded-lg p-4">
                <p className="text-xs font-semibold text-teal mb-1">Coming soon</p>
                <p className="text-xs text-gray-500">
                  Send email invitations, set permissions (view only vs full access), and manage team members directly from this page.
                </p>
              </div>
            </div>
          </div>

          {/* Seat usage */}
          {seatLimit !== Infinity && (
            <div className="card">
              <h3 className="text-sm font-semibold text-navy mb-3">Seat Usage</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-teal h-2 rounded-full"
                    style={{ width: `${(1 / seatLimit) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">1 / {seatLimit} seats</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {seatLimit - 1} seat{seatLimit - 1 !== 1 ? "s" : ""} available.{" "}
                <a href="/dashboard/settings/billing" className="text-teal hover:underline">
                  Upgrade for more →
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
