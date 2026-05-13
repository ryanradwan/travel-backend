import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatInterface from "@/components/dashboard/ChatInterface";

interface ChatPageProps {
  searchParams: { workflow?: string };
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profileResult = await supabase
    .from("business_profiles")
    .select("business_name")
    .eq("user_id", user.id)
    .single();

  const profile = profileResult.data as { business_name: string } | null;

  return (
    <div className="h-[calc(100vh-3.5rem)] -m-6 flex flex-col">
      <ChatInterface
        initialWorkflow={searchParams.workflow}
        businessName={profile?.business_name}
      />
    </div>
  );
}
