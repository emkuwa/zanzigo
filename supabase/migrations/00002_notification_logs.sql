-- Create notification_logs table for delivery tracking
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES transfer_requests(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  recipient_whatsapp TEXT NOT NULL,
  message TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('whatsapp_cloud', 'twilio', 'mock')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users can view notification logs" ON notification_logs;
CREATE POLICY "Admin users can view notification logs"
  ON notification_logs FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Service role can insert notification logs" ON notification_logs;
CREATE POLICY "Service role can insert notification logs"
  ON notification_logs FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notification_logs_request ON notification_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_driver ON notification_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON notification_logs(created_at DESC);
