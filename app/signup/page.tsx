import { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Start Free Trial — TripDesk.ai",
  description: "Try TripDesk.ai free for 7 days. AI-powered operations for travel businesses.",
};

interface SignupPageProps {
  searchParams: { ref?: string };
}

export default function SignupPage({ searchParams }: SignupPageProps) {
  const subtitle = searchParams.ref
    ? "You've been referred! Sign up for 50% off your first month."
    : "7 days free. No credit card required to start.";

  return (
    <AuthLayout title="Start your free trial" subtitle={subtitle}>
      <SignupForm referralCode={searchParams.ref} />
    </AuthLayout>
  );
}
