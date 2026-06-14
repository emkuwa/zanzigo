-- Add priority_level to transfer_requests
ALTER TABLE transfer_requests ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'standard' CHECK (priority_level IN ('urgent', 'standard'));
ALTER TABLE transfer_requests ADD COLUMN IF NOT EXISTS backup_notified BOOLEAN DEFAULT false;
ALTER TABLE transfer_requests ADD COLUMN IF NOT EXISTS admin_notified BOOLEAN DEFAULT false;

-- Create backup_driver_priority table
CREATE TABLE IF NOT EXISTS backup_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  priority_level INTEGER DEFAULT 1, -- 1 is highest priority backup
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(driver_id)
);

-- Index for status tracking
CREATE INDEX IF NOT EXISTS idx_transfer_requests_updated_at ON transfer_requests(updated_at);

-- Policy for backup drivers
ALTER TABLE backup_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage backup drivers" ON backup_drivers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can view active backup drivers" ON backup_drivers FOR SELECT USING (active = true);
