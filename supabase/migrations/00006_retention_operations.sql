-- Add referral system to drivers
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES drivers(id) ON DELETE SET NULL;

-- Create index for referrals
CREATE INDEX IF NOT EXISTS idx_drivers_referred_by ON drivers(referred_by_id);

-- Add average response time column to drivers for performance tracking
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS avg_response_time_minutes DECIMAL(10,2) DEFAULT 0;

-- Function to update driver referral code if missing
UPDATE drivers SET referral_code = substring(gen_random_uuid()::text, 1, 8) WHERE referral_code IS NULL;
