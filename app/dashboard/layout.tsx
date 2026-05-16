import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileResult, userResult, followUpsResult, inboxResult] = await Promise.all([
    supabase.from("business_profiles").select("business_name").eq("user_id", user.id).single(),
    supabase.from("users").select("subscription_tier").eq("id", user.id).single(),
    supabase.from("email_drafts").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "pending"),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["new", "draft_ready"]),
  ]);

  const profile = profileResult.data as { business_name: string } | null;
  const userData = userResult.data as { subscription_tier: string } | null;

  if (!profile) redirect("/onboarding");

  const tier = userData?.subscription_tier ?? "starter";
  const pendingFollowUps = followUpsResult.count ?? 0;
  const pendingInquiries = inboxResult.count ?? 0;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar
          businessName={profile.business_name}
          userEmail={user.email}
          tier={tier}
          pendingFollowUps={pendingFollowUps}
          pendingInquiries={pendingInquiries}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          businessName={profile.business_name}
          userEmail={user.email}
          tier={tier}
        />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
