-- Add acceptance_token to notification_logs
ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS acceptance_token UUID DEFAULT gen_random_uuid();
CREATE INDEX IF NOT EXISTS idx_notification_logs_token ON notification_logs(acceptance_token);

-- Create analytics_events table for conversion tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'form_open', 'form_submit', 'booking_complete'
  page_path TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for analytics
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view analytics" ON analytics_events FOR SELECT USING (auth.role() = 'authenticated');

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
