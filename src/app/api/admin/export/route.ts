
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'requests'; // requests, drivers, notifications
    
    const supabase = await createServerSupabase();
    let data;

    if (type === 'requests') {
      const { data: requests } = await supabase
        .from('transfer_requests')
        .select('*')
        .order('created_at', { ascending: false });
      data = requests;
    } else if (type === 'drivers') {
      const { data: drivers } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });
      data = drivers;
    }

    if (!data) return NextResponse.json({ error: 'No data' }, { status: 404 });

    // Simple CSV conversion
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row: any) => 
      Object.values(row).map(val => `"${val}"`).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=zanzigo_${type}_${new Date().toISOString().split('T')[0]}.csv`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
