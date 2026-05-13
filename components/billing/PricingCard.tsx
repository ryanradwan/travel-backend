"use client";

import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  isCurrentPlan: boolean;
  isMostPopular?: boolean;
  billing: "monthly" | "annual";
  monthlyPriceId: string;
  annualPriceId: string;
  plan: string;
  onSelect: (priceId: string, plan: string, billing: "monthly" | "annual") => void;
  loading: boolean;
}

export default function PricingCard({
  name,
  monthlyPrice,
  annualPrice,
  features,
  isCurrentPlan,
  isMostPopular,
  billing,
  monthlyPriceId,
  annualPriceId,
  plan,
  onSelect,
  loading,
}: PricingCardProps) {
  const displayPrice = billing === "annual"
    ? Math.round(annualPrice / 12 / 100)
    : Math.round(monthlyPrice / 100);
  const priceId = billing === "annual" ? annualPriceId : monthlyPriceId;
  const annualSavings = Math.round((monthlyPrice * 12 - annualPrice) / 100);

  return (
    <div className={cn(
      "card relative flex flex-col",
      isMostPopular && "border-teal ring-1 ring-teal",
      isCurrentPlan && "border-navy"
    )}>
      {isMostPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-teal text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-navy">{name}</h3>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-3xl font-bold text-navy">${displayPrice}</span>
          <span className="text-gray-400 text-sm mb-1">/mo</span>
        </div>
        {billing === "annual" && (
          <p className="text-xs text-teal mt-1">Save ${annualSavings}/year</p>
        )}
        {billing === "monthly" && (
          <p className="text-xs text-gray-400 mt-1">Billed monthly</p>
        )}
      </div>

      <ul className="space-y-2 flex-1 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
            <Check size={15} className="text-teal flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <div className="w-full py-2 text-center text-sm font-medium text-navy border border-navy rounded">
          Current plan
        </div>
      ) : (
        <Button
          variant="teal"
          size="md"
          className="w-full"
          loading={loading}
          onClick={() => onSelect(priceId, plan, billing)}
        >
          Start 7-day free trial
        </Button>
      )}
    </div>
  );
}
