-- PHASE 36: Route Pricing Update - Zanzibar Market Rates 2026
-- Updates all route prices to current market-aligned rates
-- Adds exchange_rate column to settings for USD/TZS conversion

-- Add exchange_rate column to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,2) DEFAULT 2800.00;

-- Update default exchange rate
UPDATE settings SET exchange_rate = 2800.00 WHERE exchange_rate IS NULL;

-- Clear existing route pricing and insert updated rates
DELETE FROM route_pricing WHERE vehicle_type = 'sedan';

INSERT INTO route_pricing (pickup_location, destination, vehicle_type, price_usd, active)
VALUES
  -- Airport routes
  ('Abeid Amani Karume Airport', 'Stone Town', 'sedan', 15.00, true),
  ('Abeid Amani Karume Airport', 'Paje', 'sedan', 35.00, true),
  ('Abeid Amani Karume Airport', 'Jambiani', 'sedan', 35.00, true),
  ('Abeid Amani Karume Airport', 'Bwejuu', 'sedan', 35.00, true),
  ('Abeid Amani Karume Airport', 'Michamvi', 'sedan', 40.00, true),
  ('Abeid Amani Karume Airport', 'Kizimkazi', 'sedan', 40.00, true),
  ('Abeid Amani Karume Airport', 'Nungwi', 'sedan', 50.00, true),
  ('Abeid Amani Karume Airport', 'Kendwa', 'sedan', 50.00, true),

  -- Stone Town routes
  ('Stone Town', 'Abeid Amani Karume Airport', 'sedan', 15.00, true),
  ('Stone Town', 'Paje', 'sedan', 35.00, true),
  ('Stone Town', 'Jambiani', 'sedan', 35.00, true),
  ('Stone Town', 'Bwejuu', 'sedan', 35.00, true),
  ('Stone Town', 'Michamvi', 'sedan', 40.00, true),
  ('Stone Town', 'Nungwi', 'sedan', 50.00, true),
  ('Stone Town', 'Kendwa', 'sedan', 50.00, true),

  -- Paje routes
  ('Paje', 'Jambiani', 'sedan', 15.00, true),
  ('Paje', 'Bwejuu', 'sedan', 15.00, true),
  ('Paje', 'Michamvi', 'sedan', 25.00, true),
  ('Paje', 'Nungwi', 'sedan', 60.00, true),
  ('Paje', 'Kendwa', 'sedan', 60.00, true),

  -- Jambiani routes
  ('Jambiani', 'Nungwi', 'sedan', 65.00, true),
  ('Jambiani', 'Kendwa', 'sedan', 65.00, true),

  -- Bwejuu routes
  ('Bwejuu', 'Nungwi', 'sedan', 60.00, true),
  ('Bwejuu', 'Kendwa', 'sedan', 60.00, true),

  -- Michamvi routes
  ('Michamvi', 'Nungwi', 'sedan', 70.00, true),
  ('Michamvi', 'Kendwa', 'sedan', 70.00, true)
ON CONFLICT (pickup_location, destination, vehicle_type)
DO UPDATE SET price_usd = EXCLUDED.price_usd, active = true, updated_at = now();
