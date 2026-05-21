-- Migration 007: Document columns added directly to live DB
-- These columns already exist in production. Using ADD COLUMN IF NOT EXISTS
-- so this is safe to apply and makes fresh environments match production.

-- ── business_profiles: brand + contact columns ───────────────────────────────
ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS brand_color    text DEFAULT '#0E7C7B',
  ADD COLUMN IF NOT EXISTS brand_logo_url text,
  ADD COLUMN IF NOT EXISTS brand_tagline  text,
  ADD COLUMN IF NOT EXISTS contact_phone  text,
  ADD COLUMN IF NOT EXISTS contact_email  text,
  ADD COLUMN IF NOT EXISTS website_url    text;

-- ── task_usage: per-workflow quotas + token tracking ─────────────────────────
ALTER TABLE public.task_usage
  ADD COLUMN IF NOT EXISTS reports_used      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reports_limit     integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS itineraries_used  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS itineraries_limit integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS packages_used     integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS packages_limit    integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS credits_used      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_limit     integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS tokens_used       bigint  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tokens_limit      bigint  NOT NULL DEFAULT 500000;
