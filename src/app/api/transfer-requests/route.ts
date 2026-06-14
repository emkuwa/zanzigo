import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { sendWhatsAppNotification, formatWhatsAppMessage } from '@/lib/notifications';

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('transfer_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();

    const { data: transferRequest, error } = await supabase
      .from('transfer_requests')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    // 1. Create system notification for all drivers (in-app)
    await supabase.from('notifications').insert({
      title: 'New Transfer Request',
      message: `New request from ${transferRequest.pickup_location} to ${transferRequest.destination}`,
      type: 'request',
    });

    // 2. Notify approved and online drivers via WhatsApp
    const { data: onlineDrivers } = await supabase
      .from('drivers')
      .select('id, whatsapp')
      .eq('status', 'approved')
      .eq('availability_status', 'online');

    if (onlineDrivers && onlineDrivers.length > 0) {
      const message = formatWhatsAppMessage(transferRequest);
      
      Promise.allSettled(
        onlineDrivers.map(driver => 
          sendWhatsAppNotification({
            requestId: transferRequest.id,
            driverId: driver.id,
            phone: driver.whatsapp,
            message: message
          })
        )
      ).catch(err => console.error('Error sending batch notifications:', err));
    }

    // 3. Notify Tourist about Receipt
    await sendWhatsAppNotification({
      requestId: transferRequest.id,
      driverId: 'system',
      phone: transferRequest.tourist_whatsapp,
      message: `Hello ${transferRequest.tourist_name}, we have received your ZanziGo transfer request from ${transferRequest.pickup_location} to ${transferRequest.destination}.

We are currently searching for an available driver. You will receive another message with driver details as soon as someone accepts your trip.`
    }).catch(err => console.error('Error notifying tourist of receipt:', err));

    return NextResponse.json(transferRequest, { status: 201 });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
