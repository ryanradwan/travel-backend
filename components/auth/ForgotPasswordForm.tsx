"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { resetPassword } from "@/app/auth/actions";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" loading={pending} className="w-full">
      {pending ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export default function ForgotPasswordForm() {
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null);

  async function handleAction(formData: FormData) {
    const res = await resetPassword(formData);
    setResult(res ?? null);
  }

  if (result?.success) {
    return <Alert type="success" message={result.success} />;
  }

  return (
    <form action={handleAction} className="space-y-4">
      {result?.error && <Alert type="error" message={result.error} />}

      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@youragency.com"
        hint="We'll send a password reset link to this address."
      />

      <SubmitButton />

      <p className="text-sm text-center text-gray-500">
        Remember it?{" "}
        <Link href="/login" className="text-teal font-medium hover:underline">Back to log in</Link>
      </p>
    </form>
  );
}
