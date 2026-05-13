import { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Start Free Trial — TripDesk.ai",
  description: "Try TripDesk.ai free for 7 days. AI-powered operations for travel businesses.",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Start your free trial"
      subtitle="7 days free. No credit card required to start."
    >
      <SignupForm />
    </AuthLayout>
  );
}
