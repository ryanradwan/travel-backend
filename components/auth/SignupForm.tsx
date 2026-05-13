"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signup } from "@/app/auth/actions";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="teal" size="lg" loading={pending} className="w-full">
      {pending ? "Creating account…" : "Start free trial"}
    </Button>
  );
}

interface SignupFormProps {
  referralCode?: string;
}

export default function SignupForm({ referralCode }: SignupFormProps) {
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null);

  async function handleAction(formData: FormData) {
    const res = await signup(formData);
    setResult(res ?? null);
  }

  if (result?.success) {
    return (
      <div className="space-y-4">
        <Alert type="success" message={result.success} />
        <p className="text-sm text-gray-500 text-center">
          Once verified, <Link href="/login" className="text-teal font-medium hover:underline">log in to get started</Link>.
        </p>
      </div>
    );
  }

  return (
    <form action={handleAction} className="space-y-4">
      {result?.error && <Alert type="error" message={result.error} />}

      {referralCode && (
        <>
          <input type="hidden" name="referral_code" value={referralCode} />
          <div className="bg-teal/10 border border-teal/30 rounded px-3 py-2 text-sm text-teal">
            Referral code applied: <strong>{referralCode.toUpperCase()}</strong> — 50% off your first month
          </div>
        </>
      )}

      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@youragency.com"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="At least 8 characters"
        hint="Minimum 8 characters"
      />

      <SubmitButton />

      <p className="text-xs text-gray-500 text-center">
        By signing up you agree to our{" "}
        <Link href="/terms" className="underline hover:text-navy">Terms of Service</Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-navy">Privacy Policy</Link>.
        Your 7-day free trial starts immediately.
      </p>

      <p className="text-sm text-center text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-teal font-medium hover:underline">Log in</Link>
      </p>
    </form>
  );
}
