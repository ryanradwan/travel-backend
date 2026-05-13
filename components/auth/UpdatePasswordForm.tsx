"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updatePassword } from "@/app/auth/actions";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="teal" size="lg" loading={pending} className="w-full">
      {pending ? "Updating…" : "Set new password"}
    </Button>
  );
}

export default function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    const res = await updatePassword(formData);
    if (res?.error) setError(res.error);
  }

  return (
    <form action={handleAction} className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <Input
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="At least 8 characters"
      />

      <Input
        label="Confirm new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Repeat your new password"
      />

      <SubmitButton />
    </form>
  );
}
