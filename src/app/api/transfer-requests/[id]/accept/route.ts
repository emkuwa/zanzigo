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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: driver } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', user.email)
      .eq('status', 'approved')
      .single();

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found or not approved' }, { status: 403 });
    }

    const { data: transferRequest } = await supabase
      .from('transfer_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (!transferRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const { data: existingAssignment } = await supabase
      .from('trip_assignments')
      .select('id')
      .eq('request_id', id)
      .single();

    if (existingAssignment) {
      return NextResponse.json({ error: 'Request already assigned' }, { status: 409 });
    }

    const { data: trip, error: tripError } = await supabase
      .from('trip_assignments')
      .insert({
        request_id: id,
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

    if (tripError) throw tripError;

    const { error: updateError } = await supabase
      .from('transfer_requests')
      .update({ status: 'assigned' })
      .eq('id', id);

    if (updateError) throw updateError;

    // Notify Tourist about Driver Details
    const touristMessage = `Great news! Your ZanziGo driver ${driver.full_name} has accepted your trip.

Vehicle: ${driver.vehicle_type} (${driver.vehicle_registration})
Phone: ${driver.phone}

Your driver will contact you shortly via WhatsApp.`;

    sendWhatsAppNotification({
      requestId: id,
      driverId: driver.id,
      phone: transferRequest.tourist_whatsapp,
      message: touristMessage
    }).catch(err => console.error('Error notifying tourist:', err));

    // Notify Driver about Tourist Details with Deep Links
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zanzigo.com';
    const driverMessage = `Trip Assigned!

Tourist: ${transferRequest.tourist_name}
WhatsApp: ${transferRequest.tourist_whatsapp}
Pickup: ${transferRequest.pickup_location}
Destination: ${transferRequest.destination}
Date/Time: ${transferRequest.pickup_date} at ${transferRequest.pickup_time}

📞 Call Tourist: tel:${transferRequest.tourist_whatsapp}
💬 WhatsApp Chat: https://wa.me/${transferRequest.tourist_whatsapp.replace(/[^0-9]/g, '')}

Please contact the tourist to confirm pickup.`;

    sendWhatsAppNotification({
      requestId: id,
      driverId: driver.id,
      phone: driver.whatsapp,
      message: driverMessage
    }).catch(err => console.error('Error notifying driver:', err));

    await supabase.from('notifications').insert({
      user_id: null,
      title: 'Trip Accepted',
      message: `Driver ${driver.full_name} has accepted your trip.`,
      type: 'assignment',
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error('Accept trip error:', error);
    return NextResponse.json({ error: 'Failed to accept request' }, { status: 500 });
  }
}
