"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveBusinessProfile } from "@/app/onboarding/actions";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";

const BUSINESS_TYPES = [
  { value: "travel_agency", label: "Travel Agency" },
  { value: "independent_advisor", label: "Independent Travel Advisor" },
  { value: "tour_operator", label: "Tour Operator" },
  { value: "destination_management", label: "Destination Management Company" },
  { value: "corporate_travel", label: "Corporate Travel Management" },
  { value: "luxury_travel", label: "Luxury Travel Specialist" },
  { value: "adventure_travel", label: "Adventure Travel Company" },
  { value: "cruise_specialist", label: "Cruise Specialist" },
  { value: "other", label: "Other" },
];

const TARGET_CLIENTS = [
  { value: "families", label: "Families" },
  { value: "couples", label: "Couples & Honeymoons" },
  { value: "corporate", label: "Corporate Travelers" },
  { value: "adventure", label: "Adventure Seekers" },
  { value: "luxury", label: "Luxury Travelers" },
  { value: "groups", label: "Groups & Events" },
  { value: "seniors", label: "Senior Travelers" },
  { value: "all", label: "All Types" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="teal" size="lg" loading={pending} className="w-full">
      {pending ? "Setting up your workspace…" : "Go to my dashboard →"}
    </Button>
  );
}

export default function BusinessProfileForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    const res = await saveBusinessProfile(formData);
    if (res?.error) setError(res.error);
  }

  return (
    <form action={handleAction} className="space-y-5">
      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Business name"
            name="business_name"
            required
            placeholder="Sunshine Travel Co."
          />
        </div>

        <Select
          label="Business type"
          name="business_type"
          required
          placeholder="Select type…"
          options={BUSINESS_TYPES}
        />

        <Input
          label="Location (city, state)"
          name="location"
          required
          placeholder="Miami, FL"
        />

        <Select
          label="Primary clients"
          name="target_clients"
          placeholder="Select…"
          options={TARGET_CLIENTS}
        />

        <Input
          label="Specialty destinations"
          name="specialty_destinations"
          placeholder="Italy, Caribbean, Japan…"
          hint="Comma-separated — helps TripDesk personalize responses"
        />

        <Input
          label="Team size"
          name="team_size"
          type="number"
          min={1}
          defaultValue={1}
          placeholder="1"
        />

        <Input
          label="Years in business"
          name="years_in_business"
          type="number"
          min={0}
          defaultValue={0}
          placeholder="5"
        />

        <Input
          label="Website (optional)"
          name="website"
          type="url"
          placeholder="https://yoursite.com"
        />

        <Input
          label="Phone (optional)"
          name="phone"
          type="tel"
          placeholder="+1 (305) 000-0000"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
