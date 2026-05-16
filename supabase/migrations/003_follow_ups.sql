-- Add return_date to bookings for post-trip follow-up tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_date date;

-- One follow-up sequence per booking; tracks Day 3 / 7 / 14 state
CREATE TABLE IF NOT EXISTS follow_up_sequences (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id      uuid        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_name     text        NOT NULL,
  client_email    text        NOT NULL,
  destination     text        NOT NULL,
  proposal_sent_at timestamptz NOT NULL DEFAULT now(),
  day3_status     text        NOT NULL DEFAULT 'pending',   -- pending | drafted | sent | skipped
  day7_status     text        NOT NULL DEFAULT 'pending',
  day14_status    text        NOT NULL DEFAULT 'pending',
  status          text        NOT NULL DEFAULT 'active',    -- active | cancelled
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id)
);

ALTER TABLE follow_up_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_sequences" ON follow_up_sequences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Individual email drafts awaiting advisor approval (both follow-up and post-trip)
CREATE TABLE IF NOT EXISTS email_drafts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id  uuid        REFERENCES bookings(id) ON DELETE SET NULL,
  sequence_id uuid        REFERENCES follow_up_sequences(id) ON DELETE SET NULL,
  -- follow_up_day3 | follow_up_day7 | follow_up_day14 | post_trip_checkin | post_trip_review
  draft_type  text        NOT NULL,
  client_name  text       NOT NULL,
  client_email text       NOT NULL,
  destination  text,
  subject     text        NOT NULL,
  body        text        NOT NULL,
  status      text        NOT NULL DEFAULT 'pending',  -- pending | sent | skipped
  sent_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_drafts" ON email_drafts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes for cron lookups
CREATE INDEX IF NOT EXISTS idx_fus_active ON follow_up_sequences(proposal_sent_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_ed_pending ON email_drafts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_return ON bookings(return_date) WHERE return_date IS NOT NULL;
