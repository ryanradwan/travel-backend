"use client";

import { useState } from "react";
import PricingCard from "./PricingCard";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

interface PriceIds {
  starter: { monthly: string; annual: string };
  professional: { monthly: string; annual: string };
  agency: { monthly: string; annual: string };
}

interface BillingPageProps {
  currentTier: string;
  currentStatus: string;
  trialEndsAt: string | null;
  creditsUsed: number;
  creditsLimit: number;
  hasStripeCustomer: boolean;
  priceIds: PriceIds;
  referralCode: string | null;
}

const PLAN_FEATURES = {
  starter: [
    "7-day free trial",
    "5 itineraries/month",
    "5 destination reports/month",
    "5 tour packages/month",
    "20 credits/month",
    "1 seat",
    "8 connectors",
    "3 custom skills",
    "3 custom plugins",
    "Template library access",
    "Email support (48h)",
  ],
  professional: [
    "7-day free trial",
    "15 itineraries/month",
    "15 destination reports/month",
    "15 tour packages/month",
    "50 credits/month",
    "5 seats",
    "20 connectors",
    "10 custom skills",
    "10 custom plugins",
    "Template library access",
    "Priority support (24h)",
  ],
  agency: [
    "7-day free trial",
    "Unlimited itineraries",
    "Unlimited destination reports",
    "Unlimited tour packages",
    "Unlimited credits",
    "Unlimited seats",
    "All connectors (current + future)",
    "Unlimited custom skills & plugins",
    "Build + sell on Marketplace",
    "Template library access",
    "Same-day chat support",
  ],
};

export default function BillingPage({
  currentTier,
  currentStatus,
  trialEndsAt,
  creditsUsed,
  creditsLimit,
  hasStripeCustomer,
  priceIds,
  referralCode,
}: BillingPageProps) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isTrialing = currentStatus === "trialing";
  const isPastDue = currentStatus === "past_due";
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  async function handleSelectPlan(priceId: string, plan: string, billingCycle: "monthly" | "annual") {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription", plan, billing: billingCycle, priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Could not open billing portal.");
    } catch {
      setError("Could not open billing portal. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Billing & Plan</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your subscription, usage, and payment details.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Status banners */}
      {isPastDue && (
        <Alert
          type="error"
          message="Your last payment failed. Please update your payment method to avoid losing access."
        />
      )}
      {isTrialing && trialDaysLeft !== null && (
        <Alert
          type="info"
          message={`Your free trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"}. Add a plan below to continue after your trial.`}
        />
      )}

      {/* Current usage */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-navy">Current Usage</h3>
          <span className="text-xs text-gray-400 capitalize">{currentTier} · {currentStatus}</span>
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-2xl font-bold text-navy">{creditsUsed}</span>
          <span className="text-gray-400 text-sm mb-0.5">
            {creditsLimit === 9999 ? "/ unlimited credits" : `/ ${creditsLimit} credits this month`}
          </span>
        </div>
        {creditsLimit !== 9999 && (
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-teal transition-all"
              style={{ width: `${Math.min(100, Math.round((creditsUsed / creditsLimit) * 100))}%` }}
            />
          </div>
        )}
        {hasStripeCustomer && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              loading={loading === "portal"}
              onClick={handleManageBilling}
            >
              Manage billing & invoices →
            </Button>
          </div>
        )}
      </div>

      {/* Billing toggle */}
      <div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit mx-auto mb-8">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              billing === "monthly" ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-navy"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              billing === "annual" ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-navy"
            }`}
          >
            Annual
            <span className="ml-1.5 text-xs bg-teal text-white px-1.5 py-0.5 rounded-full">Save ~17%</span>
          </button>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PricingCard
            name="Starter"
            monthlyPrice={2900}
            annualPrice={29000}
            features={PLAN_FEATURES.starter}
            isCurrentPlan={currentTier === "starter"}
            billing={billing}
            monthlyPriceId={priceIds.starter.monthly}
            annualPriceId={priceIds.starter.annual}
            plan="starter"
            onSelect={handleSelectPlan}
            loading={loading === "starter"}
          />
          <PricingCard
            name="Professional"
            monthlyPrice={5900}
            annualPrice={59000}
            features={PLAN_FEATURES.professional}
            isCurrentPlan={currentTier === "professional"}
            isMostPopular
            billing={billing}
            monthlyPriceId={priceIds.professional.monthly}
            annualPriceId={priceIds.professional.annual}
            plan="professional"
            onSelect={handleSelectPlan}
            loading={loading === "professional"}
          />
          <PricingCard
            name="Agency"
            monthlyPrice={8900}
            annualPrice={89000}
            features={PLAN_FEATURES.agency}
            isCurrentPlan={currentTier === "agency"}
            billing={billing}
            monthlyPriceId={priceIds.agency.monthly}
            annualPriceId={priceIds.agency.annual}
            plan="agency"
            onSelect={handleSelectPlan}
            loading={loading === "agency"}
          />
        </div>
      </div>

      {/* Referral code */}
      {referralCode && (
        <div className="card">
          <h3 className="font-semibold text-navy mb-2">Your Referral Code</h3>
          <p className="text-sm text-gray-500 mb-3">
            Share your code and earn $20 credit for every business that signs up. They get 50% off their first month.
          </p>
          <div className="flex items-center gap-3">
            <code className="bg-gray-50 border border-border rounded px-3 py-2 text-navy font-mono text-sm flex-1">
              {referralCode}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(referralCode)}
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
