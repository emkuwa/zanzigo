import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { sendWhatsAppNotification } from '@/lib/notifications';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();

    const { data: req, error: reqError } = await supabase
      .from('transfer_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (reqError || !req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (req.status !== 'pending' && req.status !== 'searching') {
      return NextResponse.json({ error: 'Cannot cancel requests that are already assigned' }, { status: 400 });
    }

    const { error } = await supabase
      .from('transfer_requests')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;

    // Notify Tourist about Cancellation
    await sendWhatsAppNotification({
      requestId: id,
      driverId: 'system',
      phone: req.tourist_whatsapp,
      message: `Hello ${req.tourist_name}, your ZanziGo transfer request (${req.pickup_location} to ${req.destination}) has been cancelled as per your request. We hope to see you again soon!`
    }).catch(err => console.error('Error notifying tourist of cancellation:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel request' }, { status: 500 });
  }
}
