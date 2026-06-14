
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { usdToTzs, DEFAULT_EXCHANGE_RATE, getSeasonMultiplier, calculateSeasonalPrice } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pickup = searchParams.get('pickup');
    const destination = searchParams.get('destination');
    const vehicleType = searchParams.get('vehicle_type') || 'sedan';
    const pickupDate = searchParams.get('pickup_date') || '';

    if (!pickup || !destination) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    // Fetch exchange rate from settings
    let exchangeRate = DEFAULT_EXCHANGE_RATE;
    const { data: settings } = await supabase
      .from('settings')
      .select('exchange_rate')
      .limit(1)
      .single();
    if (settings?.exchange_rate) {
      exchangeRate = settings.exchange_rate;
    }

    // Fetch active seasons
    const { data: seasons } = await supabase
      .from('seasons')
      .select('name, multiplier, start_date, end_date, is_active');

    const activeSeasons = seasons || [];

    // Fetch base price
    const { data, error } = await supabase
      .from('route_pricing')
      .select('price_usd')
      .eq('pickup_location', pickup)
      .eq('destination', destination)
      .eq('vehicle_type', vehicleType)
      .eq('active', true)
      .single();

    if (error) {
      return NextResponse.json({ price: null, price_tzs: null, exchange_rate: exchangeRate });
    }

    const basePriceUsd = data.price_usd;

    // Apply seasonal multiplier
    const { name: seasonName, multiplier } = getSeasonMultiplier(pickupDate, activeSeasons);
    const seasonal = calculateSeasonalPrice(basePriceUsd, multiplier, exchangeRate);

    return NextResponse.json({
      // Backward compatible fields
      price: seasonal.final_price_usd,
      price_usd: seasonal.final_price_usd,
      price_tzs: seasonal.final_price_tzs,
      exchange_rate: exchangeRate,

      // Seasonal breakdown
      base_price_usd: seasonal.base_price_usd,
      base_price_tzs: seasonal.base_price_tzs,
      season_name: seasonName,
      season_multiplier: multiplier,
      adjustment_usd: seasonal.adjustment_usd,
      adjustment_tzs: seasonal.adjustment_tzs,
      final_price_usd: seasonal.final_price_usd,
      final_price_tzs: seasonal.final_price_tzs,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}
