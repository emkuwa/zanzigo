
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { sendWhatsAppNotification } from '@/lib/notifications';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createServerSupabase();

    // 1. Find the log/token
    const { data: log, error: logError } = await supabase
      .from('notification_logs')
      .select('*, drivers(*), transfer_requests(*)')
      .eq('acceptance_token', token)
      .single();

    if (logError || !log) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
    }

    const driver = log.drivers;
    const transferRequest = log.transfer_requests;

    // 2. Check if request is still pending
    if (transferRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: 'This trip has already been accepted by another driver or was cancelled.',
        status: transferRequest.status
      }, { status: 410 });
    }

    // 3. Create assignment
    const { data: trip, error: tripError } = await supabase
      .from('trip_assignments')
      .insert({
        request_id: transferRequest.id,
        driver_id: driver.id,
        driver_name: driver.full_name,
        driver_phone: driver.phone,
        driver_whatsapp: driver.whatsapp,
        vehicle_type: driver.vehicle_type,
        vehicle_registration: driver.vehicle_registration,
        status: 'assigned',
        accepted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (tripError) {
      if (tripError.code === '23505') { // Unique constraint
        return NextResponse.json({ error: 'Already assigned' }, { status: 409 });
      }
      throw tripError;
    }

    // 4. Update request status
    await supabase
      .from('transfer_requests')
      .update({ status: 'assigned' })
      .eq('id', transferRequest.id);

    // 5. Notify Tourist
    const touristMessage = `Great news! Your ZanziGo driver ${driver.full_name} has accepted your trip.

Vehicle: ${driver.vehicle_type} (${driver.vehicle_registration})
Phone: ${driver.phone}

Your driver will contact you shortly via WhatsApp.`;

    sendWhatsAppNotification({
      requestId: transferRequest.id,
      driverId: driver.id,
      phone: transferRequest.tourist_whatsapp,
      message: touristMessage
    }).catch(err => console.error('Error notifying tourist:', err));

    // 6. Notify Driver with contact links
    const driverMessage = `Trip Assigned!

Tourist: ${transferRequest.tourist_name}
WhatsApp: ${transferRequest.tourist_whatsapp}
Pickup: ${transferRequest.pickup_location}
Destination: ${transferRequest.destination}
Date/Time: ${transferRequest.pickup_date} at ${transferRequest.pickup_time}

📞 Call Tourist: tel:${transferRequest.tourist_whatsapp}
💬 WhatsApp Chat: https://wa.me/${transferRequest.tourist_whatsapp.replace(/[^0-9]/g, '')}`;

    sendWhatsAppNotification({
      requestId: transferRequest.id,
      driverId: driver.id,
      phone: driver.whatsapp,
      message: driverMessage
    }).catch(err => console.error('Error notifying driver:', err));

    return NextResponse.json({ success: true, trip });
  } catch (error: any) {
    console.error('One-click acceptance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
