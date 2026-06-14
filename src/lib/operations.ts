
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabase();

  // 1. Fetch Top Rated
  const { data: topRated } = await supabase
    .from('drivers')
    .select('id, full_name, rating, total_trips')
    .eq('status', 'approved')
    .order('rating', { ascending: false })
    .limit(5);

  // 2. Fetch Most Trips
  const { data: mostTrips } = await supabase
    .from('drivers')
    .select('id, full_name, total_trips, rating')
    .eq('status', 'approved')
    .order('total_trips', { ascending: false })
    .limit(5);

  // 3. Popular Routes Performance
  const { data: routes } = await supabase.rpc('get_route_performance');

  return {
    topRated,
    mostTrips,
    routes
  };
}
