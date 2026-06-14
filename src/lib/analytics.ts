
import { createClient } from '@/lib/supabase/client';

export type EventType = 'page_view' | 'form_open' | 'form_submit' | 'booking_complete';

export async function trackEvent(eventType: EventType, metadata: any = {}) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      page_path: typeof window !== 'undefined' ? window.location.pathname : null,
      metadata: {
        ...metadata,
        user_id: user?.id || null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      }
    });
  } catch (error) {
    console.error('Tracking error:', error);
  }
}
