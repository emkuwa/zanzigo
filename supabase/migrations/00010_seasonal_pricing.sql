-- PHASE: Seasonal Pricing System
-- Adds seasons table with configurable multipliers for automatic price adjustments

-- Seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add season tracking columns to transfer_requests
ALTER TABLE transfer_requests ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id);
ALTER TABLE transfer_requests ADD COLUMN IF NOT EXISTS base_price_usd DECIMAL(10,2);
ALTER TABLE transfer_requests ADD COLUMN IF NOT EXISTS season_multiplier DECIMAL(4,2) DEFAULT 1.00;

-- Enable RLS
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view active seasons" ON seasons;
CREATE POLICY "Anyone can view active seasons"
  ON seasons FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage seasons" ON seasons;
CREATE POLICY "Admins can manage seasons"
  ON seasons FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert default seasons
INSERT INTO seasons (name, multiplier, start_date, end_date, is_active)
VALUES
  ('Low Season', 1.00, '2026-03-01', '2026-06-30', true),
  ('High Season', 1.10, '2026-07-01', '2026-10-31', true),
  ('Peak Season', 1.15, '2026-12-15', '2027-01-15', true)
ON CONFLICT DO NOTHING;

-- Index for season lookups by date
CREATE INDEX IF NOT EXISTS idx_seasons_date_range ON seasons(start_date, end_date);
