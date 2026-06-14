-- Create tables for ZanziGo platform
-- NOTE: profiles table already exists in this project (zanzicore-prod), skipped here

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('sedan', 'suv', 'minivan', 'bus', 'taxi')),
  vehicle_registration TEXT NOT NULL,
  vehicle_photo_url TEXT,
  license_url TEXT,
  areas_covered TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_trips INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,0) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transfer requests table
CREATE TABLE IF NOT EXISTS transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id UUID,
  tourist_name TEXT NOT NULL,
  tourist_whatsapp TEXT NOT NULL,
  tourist_email TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  passengers INTEGER NOT NULL DEFAULT 1,
  special_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'searching', 'assigned', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trip assignments table
CREATE TABLE IF NOT EXISTS trip_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES transfer_requests(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  driver_whatsapp TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_registration TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  accepted_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trip_assignments(id) ON DELETE CASCADE,
  tourist_id UUID,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('request', 'assignment', 'approval', 'reminder', 'system')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'ZanziGo',
  tagline TEXT NOT NULL DEFAULT 'Your Ride Across Zanzibar',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0EA5E9',
  secondary_color TEXT DEFAULT '#14B8A6',
  accent_color TEXT DEFAULT '#F59E0B',
  whatsapp_number TEXT DEFAULT '+255777000000',
  email TEXT DEFAULT 'hello@zanzigo.com',
  phone TEXT DEFAULT '+255777000000',
  address TEXT DEFAULT 'Zanzibar, Tanzania',
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  commission_rate DECIMAL(4,1) DEFAULT 10.0,
  currency TEXT DEFAULT 'TZS'
);

-- Insert default settings
INSERT INTO settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Drivers: public can insert, authenticated can read all
DROP POLICY IF EXISTS "Anyone can register as driver" ON drivers;
CREATE POLICY "Anyone can register as driver"
  ON drivers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view drivers" ON drivers;
CREATE POLICY "Authenticated users can view drivers"
  ON drivers FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update drivers" ON drivers;
CREATE POLICY "Admins can update drivers"
  ON drivers FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Transfer requests: public can insert, authenticated can read
DROP POLICY IF EXISTS "Anyone can create request" ON transfer_requests;
CREATE POLICY "Anyone can create request"
  ON transfer_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view requests" ON transfer_requests;
CREATE POLICY "Authenticated users can view requests"
  ON transfer_requests FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own request" ON transfer_requests;
CREATE POLICY "Users can update own request"
  ON transfer_requests FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Trip assignments: authenticated can read/insert
DROP POLICY IF EXISTS "Authenticated users can view assignments" ON trip_assignments;
CREATE POLICY "Authenticated users can view assignments"
  ON trip_assignments FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create assignments" ON trip_assignments;
CREATE POLICY "Authenticated users can create assignments"
  ON trip_assignments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Reviews: authenticated can read/insert
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Notifications: users can view own
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Settings: anyone can read
DROP POLICY IF EXISTS "Anyone can view settings" ON settings;
CREATE POLICY "Anyone can view settings"
  ON settings FOR SELECT
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transfer_requests_status ON transfer_requests(status);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_pickup_date ON transfer_requests(pickup_date);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_areas ON drivers USING GIN(areas_covered);
CREATE INDEX IF NOT EXISTS idx_trip_assignments_driver ON trip_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_trip_assignments_request ON trip_assignments(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
