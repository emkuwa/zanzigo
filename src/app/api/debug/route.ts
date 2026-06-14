import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics: Record<string, string> = {};

  // Check environment variables (presence only, no secrets exposed)
  diagnostics.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'MISSING';
  diagnostics.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'MISSING';
  diagnostics.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'MISSING';
  diagnostics.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'MISSING';
  diagnostics.NODE_ENV = process.env.NODE_ENV || 'unknown';
  diagnostics.VERCEL = process.env.VERCEL || 'not-vercel';

  // Test Supabase client creation
  try {
    const { createServerClient } = await import('@supabase/ssr');
    diagnostics.supabase_import = 'ok';
  } catch (e: any) {
    diagnostics.supabase_import = `FAILED: ${e.message}`;
  }

  // Test Supabase connection with anon key
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      diagnostics.supabase_connection = 'SKIPPED: missing env vars';
    } else {
      const res = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
      });
      diagnostics.supabase_connection = `status=${res.status}`;
      diagnostics.supabase_url_reachable = res.ok ? 'yes' : 'no';
    }
  } catch (e: any) {
    diagnostics.supabase_connection = `FAILED: ${e.message}`;
  }

  // Test cookies() import
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    diagnostics.cookies_import = 'ok';
  } catch (e: any) {
    diagnostics.cookies_import = `FAILED: ${e.message}`;
  }

  // Test createServerSupabase
  try {
    const { createServerSupabase } = await import('@/lib/supabase/server');
    const supabase = await createServerSupabase();
    diagnostics.createServerSupabase = 'ok';

    // Test a simple query
    const { data, error } = await supabase.from('settings').select('id').limit(1);
    if (error) {
      diagnostics.supabase_query = `FAILED: ${error.message} (code: ${error.code})`;
    } else {
      diagnostics.supabase_query = `ok (${data?.length || 0} rows)`;
    }
  } catch (e: any) {
    diagnostics.createServerSupabase = `FAILED: ${e.message}`;
  }

  return NextResponse.json({
    status: 'diagnostic',
    timestamp: new Date().toISOString(),
    diagnostics,
  });
}
