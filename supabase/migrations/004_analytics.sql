-- Track when a booking was confirmed/completed for time-to-close analytics
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
