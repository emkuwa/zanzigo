
import { createServerSupabase } from './supabase/server';

export type WhatsAppProvider = 'whatsapp_cloud' | 'twilio' | 'mock';

export interface SendWhatsAppParams {
  requestId: string;
  driverId: string;
  phone: string;
  message: string;
}

export async function sendWhatsAppNotification({
  requestId,
  driverId,
  phone,
  message
}: SendWhatsAppParams) {
  const provider = (process.env.WHATSAPP_PROVIDER || 'mock') as WhatsAppProvider;
  const supabase = await createServerSupabase();

  // 1. Create notification log record with token
  const token = crypto.randomUUID();
  const { data: log, error: logError } = await supabase
    .from('notification_logs')
    .insert({
      request_id: requestId,
      driver_id: driverId,
      recipient_whatsapp: phone,
      message: message,
      provider: provider,
      status: 'pending',
      acceptance_token: token
    })
    .select()
    .single();

  if (logError) {
    console.error('Failed to create notification log:', logError);
    return { success: false, error: logError.message };
  }

  // Generate deep links
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zanzigo.com';
  const acceptLink = `${appUrl}/accept/${token}`;
  
  // Format message with deep links
  const enhancedMessage = `${message}

✅ Accept Booking:
${acceptLink}

📱 Dashboard:
${appUrl}/driver/dashboard`;

  try {
    let result: { success: boolean; providerMessageId?: string; error?: string };

    switch (provider) {
      case 'whatsapp_cloud':
        result = await sendViaWhatsAppCloud(phone, enhancedMessage);
        break;
      case 'twilio':
        result = await sendViaTwilio(phone, enhancedMessage);
        break;
      case 'mock':
      default:
        result = await sendViaMock(phone, enhancedMessage);
        break;
    }

    // 2. Update log record with result
    await supabase
      .from('notification_logs')
      .update({
        status: result.success ? 'sent' : 'failed',
        provider_message_id: result.providerMessageId,
        error_message: result.error,
        sent_at: result.success ? new Date().toISOString() : null
      })
      .eq('id', log.id);

    return result;
  } catch (error: any) {
    console.error('WhatsApp notification error:', error);
    
    await supabase
      .from('notification_logs')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', log.id);

    return { success: false, error: error.message };
  }
}

async function sendViaWhatsAppCloud(phone: string, message: string) {
  const accessToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return { success: false, error: 'WhatsApp Cloud API configuration missing' };
  }

  const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone.replace('+', ''),
      type: 'text',
      text: { body: message },
    }),
  });

  const data = await response.json();

  if (response.ok) {
    return { success: true, providerMessageId: data.messages[0].id };
  } else {
    return { success: false, error: data.error?.message || 'WhatsApp Cloud API error' };
  }
}

async function sendViaTwilio(phone: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !fromWhatsApp) {
    return { success: false, error: 'Twilio configuration missing' };
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: `whatsapp:${fromWhatsApp}`,
      To: `whatsapp:${phone}`,
      Body: message,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    return { success: true, providerMessageId: data.sid };
  } else {
    return { success: false, error: data.message || 'Twilio API error' };
  }
}

async function sendViaMock(phone: string, message: string) {
  console.log(`[MOCK WHATSAPP] To: ${phone}, Message: ${message}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, providerMessageId: `mock_${Math.random().toString(36).substr(2, 9)}` };
}

export function formatWhatsAppMessage(request: any) {
  const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://zanzigo.com'}/driver/dashboard`;
  
  return `New Transfer Request

Pickup: ${request.pickup_location}
Destination: ${request.destination}
Date: ${new Date(request.pickup_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
Passengers: ${request.passengers}

Open Dashboard:
${dashboardLink}`;
}
