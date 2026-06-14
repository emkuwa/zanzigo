import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    // Test Supabase connectivity
    const { error: dbError } = await supabase
      .from('settings')
      .select('id')
      .limit(1);

    if (dbError) {
      return NextResponse.json({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        supabase: 'error',
        error: dbError.message,
      }, { status: 503 });
    }

    // Test route_pricing table
    const { count: routeCount } = await supabase
      .from('route_pricing')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    // Test seasons table
    const { count: seasonCount } = await supabase
      .from('seasons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      supabase: 'connected',
      route_pricing: routeCount || 0,
      active_seasons: seasonCount || 0,
      environment: process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost') ? 'development' : 'production',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    }, { status: 500 });
  }
}
