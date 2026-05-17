import { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Set New Password — TravelBackend.com",
};

export default function UpdatePasswordPage() {
  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password for your account."
    >
      <UpdatePasswordForm />
    </AuthLayout>
  );
}
