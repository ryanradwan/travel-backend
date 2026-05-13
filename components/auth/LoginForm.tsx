"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { login } from "@/app/auth/actions";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" loading={pending} className="w-full">
      {pending ? "Logging in…" : "Log in"}
    </Button>
  );
}

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    const res = await login(formData);
    if (res?.error) setError(res.error);
  }

  return (
    <form action={handleAction} className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@youragency.com"
      />

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="label mb-0">Password</label>
          <Link href="/forgot-password" className="text-xs text-teal hover:underline">
            Forgot password?
          </Link>
        </div>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
          placeholder="Your password"
        />
      </div>

      <SubmitButton />

      <p className="text-sm text-center text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-teal font-medium hover:underline">
          Start your free trial
        </Link>
      </p>
    </form>
  );
}
