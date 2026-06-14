import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const body = await request.json();
    const { action } = body;

    if (!action || !['start', 'complete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: driver } = await supabase
      .from('drivers')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 403 });
    }

    const { data: trip } = await supabase
      .from('trip_assignments')
      .select('*')
      .eq('id', id)
      .eq('driver_id', driver.id)
      .single();

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (action === 'start' && trip.status !== 'assigned') {
      return NextResponse.json({ error: 'Trip must be assigned before starting' }, { status: 400 });
    }
    if (action === 'complete' && trip.status !== 'in_progress') {
      return NextResponse.json({ error: 'Trip must be in progress before completing' }, { status: 400 });
    }

    const updates: Record<string, string> = {};
    const requestStatus: Record<string, string> = {};

    if (action === 'start') {
      updates.status = 'in_progress';
      updates.started_at = new Date().toISOString();
      requestStatus.status = 'in_progress';
    } else {
      updates.status = 'completed';
      updates.completed_at = new Date().toISOString();
      requestStatus.status = 'completed';
    }

    const { error: tripError } = await supabase
      .from('trip_assignments')
      .update(updates)
      .eq('id', id);

    if (tripError) throw tripError;

    const { error: reqError } = await supabase
      .from('transfer_requests')
      .update(requestStatus)
      .eq('id', trip.request_id);

    if (reqError) throw reqError;

    return NextResponse.json({ success: true, status: updates.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
  }
}
