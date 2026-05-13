import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BusinessProfileForm from "@/components/auth/BusinessProfileForm";

export default async function SettingsProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-navy mb-6">Business Profile</h2>
      <BusinessProfileForm />
    </div>
  );
}
