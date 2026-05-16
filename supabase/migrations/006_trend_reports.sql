CREATE TABLE IF NOT EXISTS trend_reports (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_of     date        NOT NULL,  -- Monday of the report week
  report_data jsonb       NOT NULL,  -- array of 5 destination trend objects
  email_sent  boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_of)
);

ALTER TABLE trend_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_trend_reports" ON trend_reports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_trend_reports_user ON trend_reports(user_id, week_of DESC);
