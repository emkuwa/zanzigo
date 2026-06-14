import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();

    const { data, error } = await supabase
      .from('drivers')
      .insert({
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        whatsapp: body.whatsapp,
        vehicle_type: body.vehicle_type,
        vehicle_registration: body.vehicle_registration,
        areas_covered: body.areas_covered,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register driver' }, { status: 500 });
  }
}
