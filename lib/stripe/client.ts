import Stripe from "stripe";

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Convenience export — call getStripe() in route handlers, not at module level
export { getStripe as stripe };

export const PLANS = {
  starter: {
    name: "Starter",
    monthlyPrice: 2900,
    annualPrice: 29000,
    tasksPerMonth: 30,
    seats: 1,
    connectors: 6,
    customSkills: 3,
    customPlugins: 3,
    topUpRate: 500,
    supportSla: "Email 48h",
  },
  professional: {
    name: "Professional",
    monthlyPrice: 6900,
    annualPrice: 69000,
    tasksPerMonth: 100,
    seats: 5,
    connectors: 20,
    customSkills: 10,
    customPlugins: 10,
    topUpRate: 400,
    supportSla: "Priority 24h",
  },
  agency: {
    name: "Agency",
    monthlyPrice: 10900,
    annualPrice: 109000,
    tasksPerMonth: Infinity,
    seats: Infinity,
    connectors: Infinity,
    customSkills: Infinity,
    customPlugins: Infinity,
    topUpRate: 0,
    supportSla: "Chat same day",
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const TOP_UP_PRICE_IDS = {
  starter: process.env.STRIPE_TOPUP_STARTER_PRICE_ID ?? "",
  professional: process.env.STRIPE_TOPUP_PROFESSIONAL_PRICE_ID ?? "",
};
