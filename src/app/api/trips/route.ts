import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('trip_assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();
    const { data, error } = await supabase
      .from('trip_assignments')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    // Update the request status
    await supabase
      .from('transfer_requests')
      .update({ status: 'assigned' })
      .eq('id', body.request_id);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}
