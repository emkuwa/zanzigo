import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

const ROUTE_PRICING_DATA = [
  // Airport routes
  { pickup_location: 'Abeid Amani Karume Airport', destination: 'Stone Town', vehicle_type: 'sedan', price_usd: 15.00 },
  { pickup_location: 'Abeid Amani Karume Airport', destination: 'Paje', vehicle_type: 'sedan', price_usd: 35.00 },
  { pickup_location: 'Abeid Amani Karume Airport', destination: 'Jambiani', vehicle_type: 'sedan', price_usd: 35.00 },
  { pickup_location: 'Abeid Amani Karume Airport', destination: 'Bwejuu', vehicle_type: 'sedan', price_usd: 35.00 },
  { pickup_location: 'Abeid Amani Karume Airport', destination: 'Michamvi', vehicle_type: 'sedan', price_usd: 40.00 },
  { pickup_location: 'Abeid Amani Karume Airport', destination: 'Kizimkazi', vehicle_type: 'sedan', price_usd: 40.00 },
  { pickup_location: 'Abeid Amani Karume Airport', destination: 'Nungwi', vehicle_type: 'sedan', price_usd: 50.00 },
  { pickup_location: 'Abeid Amani Karume Airport', destination: 'Kendwa', vehicle_type: 'sedan', price_usd: 50.00 },
  // Stone Town routes
  { pickup_location: 'Stone Town', destination: 'Abeid Amani Karume Airport', vehicle_type: 'sedan', price_usd: 15.00 },
  { pickup_location: 'Stone Town', destination: 'Paje', vehicle_type: 'sedan', price_usd: 35.00 },
  { pickup_location: 'Stone Town', destination: 'Jambiani', vehicle_type: 'sedan', price_usd: 35.00 },
  { pickup_location: 'Stone Town', destination: 'Bwejuu', vehicle_type: 'sedan', price_usd: 35.00 },
  { pickup_location: 'Stone Town', destination: 'Michamvi', vehicle_type: 'sedan', price_usd: 40.00 },
  { pickup_location: 'Stone Town', destination: 'Nungwi', vehicle_type: 'sedan', price_usd: 50.00 },
  { pickup_location: 'Stone Town', destination: 'Kendwa', vehicle_type: 'sedan', price_usd: 50.00 },
  // Paje routes
  { pickup_location: 'Paje', destination: 'Jambiani', vehicle_type: 'sedan', price_usd: 15.00 },
  { pickup_location: 'Paje', destination: 'Bwejuu', vehicle_type: 'sedan', price_usd: 15.00 },
  { pickup_location: 'Paje', destination: 'Michamvi', vehicle_type: 'sedan', price_usd: 25.00 },
  { pickup_location: 'Paje', destination: 'Nungwi', vehicle_type: 'sedan', price_usd: 60.00 },
  { pickup_location: 'Paje', destination: 'Kendwa', vehicle_type: 'sedan', price_usd: 60.00 },
  // Jambiani routes
  { pickup_location: 'Jambiani', destination: 'Nungwi', vehicle_type: 'sedan', price_usd: 65.00 },
  { pickup_location: 'Jambiani', destination: 'Kendwa', vehicle_type: 'sedan', price_usd: 65.00 },
  // Bwejuu routes
  { pickup_location: 'Bwejuu', destination: 'Nungwi', vehicle_type: 'sedan', price_usd: 60.00 },
  { pickup_location: 'Bwejuu', destination: 'Kendwa', vehicle_type: 'sedan', price_usd: 60.00 },
  // Michamvi routes
  { pickup_location: 'Michamvi', destination: 'Nungwi', vehicle_type: 'sedan', price_usd: 70.00 },
  { pickup_location: 'Michamvi', destination: 'Kendwa', vehicle_type: 'sedan', price_usd: 70.00 },
];

const SEASONS_DATA = [
  { name: 'Low Season', multiplier: 1.00, start_date: '2026-03-01', end_date: '2026-06-30', is_active: true },
  { name: 'High Season', multiplier: 1.10, start_date: '2026-07-01', end_date: '2026-10-31', is_active: true },
  { name: 'Peak Season', multiplier: 1.15, start_date: '2026-12-15', end_date: '2027-01-15', is_active: true },
];

export async function POST() {
  const results: Record<string, unknown> = {};

  try {
    const supabase = await createServerSupabase();

    // Check current counts
    const { count: existingRoutes } = await supabase
      .from('route_pricing')
      .select('*', { count: 'exact', head: true });

    const { count: existingSeasons } = await supabase
      .from('seasons')
      .select('*', { count: 'exact', head: true });

    results.existing = { routes: existingRoutes || 0, seasons: existingSeasons || 0 };

    // Try to insert route_pricing
    const routeInserts = [];
    for (const route of ROUTE_PRICING_DATA) {
      const { error } = await supabase
        .from('route_pricing')
        .upsert(route, { onConflict: 'pickup_location,destination,vehicle_type' });
      if (error) {
        routeInserts.push({ route: `${route.pickup_location} → ${route.destination}`, error: error.message });
      }
    }

    // Try to insert seasons
    const seasonInserts = [];
    for (const season of SEASONS_DATA) {
      const { error } = await supabase
        .from('seasons')
        .upsert(season, { onConflict: 'name' });
      if (error) {
        seasonInserts.push({ season: season.name, error: error.message });
      }
    }

    // Check final counts
    const { count: finalRoutes } = await supabase
      .from('route_pricing')
      .select('*', { count: 'exact', head: true });

    const { count: finalSeasons } = await supabase
      .from('seasons')
      .select('*', { count: 'exact', head: true });

    results.route_errors = routeInserts;
    results.season_errors = seasonInserts;
    results.final = { routes: finalRoutes || 0, seasons: finalSeasons || 0 };
    results.success = routeInserts.length === 0 && seasonInserts.length === 0;

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      results,
    }, { status: 500 });
  }
}

export async function GET() {
  // GET returns the SQL needed for manual seeding
  return NextResponse.json({
    message: 'Use POST to seed data. Or run this SQL in Supabase dashboard SQL Editor:',
    sql: `
-- Route Pricing (26 routes)
INSERT INTO route_pricing (pickup_location, destination, vehicle_type, price_usd, active)
VALUES
  ('Abeid Amani Karume Airport', 'Stone Town', 'sedan', 15.00, true),
  ('Abeid Amani Karume Airport', 'Paje', 'sedan', 35.00, true),
  ('Abeid Amani Karume Airport', 'Jambiani', 'sedan', 35.00, true),
  ('Abeid Amani Karume Airport', 'Bwejuu', 'sedan', 35.00, true),
  ('Abeid Amani Karume Airport', 'Michamvi', 'sedan', 40.00, true),
  ('Abeid Amani Karume Airport', 'Kizimkazi', 'sedan', 40.00, true),
  ('Abeid Amani Karume Airport', 'Nungwi', 'sedan', 50.00, true),
  ('Abeid Amani Karume Airport', 'Kendwa', 'sedan', 50.00, true),
  ('Stone Town', 'Abeid Amani Karume Airport', 'sedan', 15.00, true),
  ('Stone Town', 'Paje', 'sedan', 35.00, true),
  ('Stone Town', 'Jambiani', 'sedan', 35.00, true),
  ('Stone Town', 'Bwejuu', 'sedan', 35.00, true),
  ('Stone Town', 'Michamvi', 'sedan', 40.00, true),
  ('Stone Town', 'Nungwi', 'sedan', 50.00, true),
  ('Stone Town', 'Kendwa', 'sedan', 50.00, true),
  ('Paje', 'Jambiani', 'sedan', 15.00, true),
  ('Paje', 'Bwejuu', 'sedan', 15.00, true),
  ('Paje', 'Michamvi', 'sedan', 25.00, true),
  ('Paje', 'Nungwi', 'sedan', 60.00, true),
  ('Paje', 'Kendwa', 'sedan', 60.00, true),
  ('Jambiani', 'Nungwi', 'sedan', 65.00, true),
  ('Jambiani', 'Kendwa', 'sedan', 65.00, true),
  ('Bwejuu', 'Nungwi', 'sedan', 60.00, true),
  ('Bwejuu', 'Kendwa', 'sedan', 60.00, true),
  ('Michamvi', 'Nungwi', 'sedan', 70.00, true),
  ('Michamvi', 'Kendwa', 'sedan', 70.00, true)
ON CONFLICT (pickup_location, destination, vehicle_type)
DO UPDATE SET price_usd = EXCLUDED.price_usd, active = true, updated_at = now();

-- Seasons
INSERT INTO seasons (name, multiplier, start_date, end_date, is_active)
VALUES
  ('Low Season', 1.00, '2026-03-01', '2026-06-30', true),
  ('High Season', 1.10, '2026-07-01', '2026-10-31', true),
  ('Peak Season', 1.15, '2026-12-15', '2027-01-15', true)
ON CONFLICT (name) DO NOTHING;
    `,
  });
}
