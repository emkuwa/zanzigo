-- Add availability status to drivers
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS availability_status TEXT NOT NULL DEFAULT 'offline' CHECK (availability_status IN ('online', 'offline', 'busy'));

-- Create index for availability
CREATE INDEX IF NOT EXISTS idx_drivers_availability ON drivers(availability_status);
