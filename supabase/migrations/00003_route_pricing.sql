-- Create route_pricing table
CREATE TABLE IF NOT EXISTS route_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'sedan',
  price_usd DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pickup_location, destination, vehicle_type)
);

-- Add price_quoted to transfer_requests
ALTER TABLE transfer_requests ADD COLUMN IF NOT EXISTS price_quoted DECIMAL(10,2);

-- Enable RLS
ALTER TABLE route_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view active route pricing" ON route_pricing;
CREATE POLICY "Anyone can view active route pricing"
  ON route_pricing FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Admins can manage route pricing" ON route_pricing;
CREATE POLICY "Admins can manage route pricing"
  ON route_pricing FOR ALL
  USING (auth.role() = 'authenticated');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_route_pricing_route ON route_pricing(pickup_location, destination);
