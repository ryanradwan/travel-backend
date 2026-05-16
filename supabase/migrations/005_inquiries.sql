-- Add a unique inquiry form token to each advisor's business profile
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS inquiry_token text UNIQUE
  DEFAULT encode(gen_random_bytes(8), 'hex');

-- Backfill any existing rows that got a NULL default (shouldn't happen, but safety net)
UPDATE business_profiles
  SET inquiry_token = encode(gen_random_bytes(8), 'hex')
  WHERE inquiry_token IS NULL;

ALTER TABLE business_profiles
  ALTER COLUMN inquiry_token SET NOT NULL;

-- Client inquiry submissions
CREATE TABLE IF NOT EXISTS inquiries (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source          text        NOT NULL DEFAULT 'form',  -- form | manual
  client_name     text        NOT NULL,
  client_email    text        NOT NULL,
  client_phone    text,
  inquiry_text    text        NOT NULL,
  -- AI-extracted fields (populated after triage)
  category        text,       -- honeymoon | family | adventure | corporate | solo | group | luxury | budget | other
  destination     text,
  travel_dates    text,
  budget          text,
  group_size      text,
  ai_summary      text,
  draft_response  text,
  -- workflow
  status          text        NOT NULL DEFAULT 'new',  -- new | draft_ready | responded | archived
  responded_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_inquiries" ON inquiries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_inquiries_user_status ON inquiries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);
