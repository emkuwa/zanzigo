
'use client';

import { useEffect } from 'react';
import { trackEvent, EventType } from '@/lib/analytics';

export function TrackPageVisit({ event = 'page_view' }: { event?: EventType }) {
  useEffect(() => {
    trackEvent(event);
  }, [event]);

  return null;
}
