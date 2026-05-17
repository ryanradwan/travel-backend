import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthLayout from "@/components/auth/AuthLayout";
import BusinessProfileForm from "@/components/auth/BusinessProfileForm";

export const metadata: Metadata = {
  title: "Set Up Your Business — TravelBackend.com",
};

export default async function OnboardingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Skip onboarding if profile already exists
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profile) redirect("/dashboard");

  return (
    <AuthLayout
      title="Tell us about your business"
      subtitle="This helps TravelBackend.com personalise every task to your specific travel business. Takes 60 seconds."
    >
      <BusinessProfileForm />
    </AuthLayout>
  );
}
