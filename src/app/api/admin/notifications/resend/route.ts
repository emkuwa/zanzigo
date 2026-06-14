
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { sendWhatsAppNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { logId } = await request.json();

    if (!logId) {
      return NextResponse.json({ error: 'Missing log ID' }, { status: 400 });
    }

    // Fetch the original log
    const { data: log, error: fetchError } = await supabase
      .from('notification_logs')
      .select('*')
      .eq('id', logId)
      .single();

    if (fetchError || !log) {
      return NextResponse.json({ error: 'Notification log not found' }, { status: 404 });
    }

    // Resend the notification
    const result = await sendWhatsAppNotification({
      requestId: log.request_id,
      driverId: log.driver_id,
      phone: log.recipient_whatsapp,
      message: log.message
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Resend notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
