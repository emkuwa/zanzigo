import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'season_revenue';

    const supabase = await createServerSupabase();

    if (type === 'season_revenue') {
      // Revenue by season from transfer_requests with season data
      const { data, error } = await supabase
        .from('transfer_requests')
        .select('season_multiplier, base_price_usd, price_quoted, pickup_location, destination')
        .eq('status', 'completed');

      if (error) throw error;

      // Group by estimated season based on multiplier
      const seasonMap: Record<string, { revenue: number; bookings: number; avgMultiplier: number }> = {};

      (data || []).forEach((trip: any) => {
        let seasonName = 'Low Season';
        const mult = trip.season_multiplier || 1.0;
        if (mult >= 1.15) seasonName = 'Peak Season';
        else if (mult > 1.0) seasonName = 'High Season';

        if (!seasonMap[seasonName]) {
          seasonMap[seasonName] = { revenue: 0, bookings: 0, avgMultiplier: 0 };
        }
        seasonMap[seasonName].revenue += trip.price_quoted || 0;
        seasonMap[seasonName].bookings += 1;
        seasonMap[seasonName].avgMultiplier += mult;
      });

      const seasonRevenue = Object.entries(seasonMap).map(([name, data]) => ({
        season: name,
        revenue: data.revenue,
        bookings: data.bookings,
        avgMultiplier: data.bookings > 0 ? Math.round((data.avgMultiplier / data.bookings) * 100) / 100 : 1,
        avgBookingValue: data.bookings > 0 ? Math.round(data.revenue / data.bookings * 100) / 100 : 0,
      }));

      return NextResponse.json({ type: 'season_revenue', data: seasonRevenue });
    }

    if (type === 'top_routes') {
      // Most profitable routes
      const { data, error } = await supabase
        .from('transfer_requests')
        .select('pickup_location, destination, price_quoted')
        .eq('status', 'completed');

      if (error) throw error;

      const routeMap: Record<string, { revenue: number; bookings: number }> = {};

      (data || []).forEach((trip: any) => {
        const key = `${trip.pickup_location} -> ${trip.destination}`;
        if (!routeMap[key]) {
          routeMap[key] = { revenue: 0, bookings: 0 };
        }
        routeMap[key].revenue += trip.price_quoted || 0;
        routeMap[key].bookings += 1;
      });

      const topRoutes = Object.entries(routeMap)
        .map(([route, data]) => ({
          route,
          revenue: data.revenue,
          bookings: data.bookings,
          avgValue: data.bookings > 0 ? Math.round(data.revenue / data.bookings * 100) / 100 : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return NextResponse.json({ type: 'top_routes', data: topRoutes });
    }

    return NextResponse.json({ error: 'Unknown analytics type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
