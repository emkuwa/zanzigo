
import { createServerSupabase } from '@/lib/supabase/server';
import { sendWhatsAppNotification } from '@/lib/notifications';

export async function processReliabilityEscalations() {
  const supabase = await createServerSupabase();
  const now = new Date();
  
  // 1. Fetch pending requests
  const { data: pendingRequests } = await supabase
    .from('transfer_requests')
    .select('*')
    .eq('status', 'pending');

  if (!pendingRequests) return;

  for (const req of pendingRequests) {
    const createdAt = new Date(req.created_at);
    const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
    
    const timeoutLimit = req.priority_level === 'urgent' ? 2 : 5;
    const backupTimeout = timeoutLimit;
    const adminTimeout = timeoutLimit * 2;

    // Phase A: Notify Backup Pool
    if (diffMinutes >= backupTimeout && !req.backup_notified) {
      const { data: backupDrivers } = await supabase
        .from('backup_drivers')
        .select('*, drivers(whatsapp, id)')
        .eq('active', true)
        .order('priority_level', { ascending: true });

      if (backupDrivers && backupDrivers.length > 0) {
        for (const backup of backupDrivers) {
          const driver = (backup as any).drivers;
          await sendWhatsAppNotification({
            requestId: req.id,
            driverId: driver.id,
            phone: driver.whatsapp,
            message: `⚠️ *BACKUP NEEDED:* No primary driver has accepted this trip yet.\n\nPickup: ${req.pickup_location}\nTo: ${req.destination}`
          });
        }
        
        // Update request
        await supabase.from('transfer_requests').update({ backup_notified: true }).eq('id', req.id);
        
        // Notify Tourist about search continuing
        await sendWhatsAppNotification({
          requestId: req.id,
          driverId: 'system',
          phone: req.tourist_whatsapp,
          message: `Hello ${req.tourist_name}, we are still searching for your driver. We have a high volume of requests, but we've escalated your booking to our priority pool. Thank you for your patience.`
        });
      }
    }

    // Phase B: Notify Admin (Escalation)
    if (diffMinutes >= adminTimeout && !req.admin_notified) {
      const { data: settings } = await supabase.from('settings').select('whatsapp_number').single();
      if (settings?.whatsapp_number) {
        await sendWhatsAppNotification({
          requestId: req.id,
          driverId: 'admin',
          phone: settings.whatsapp_number,
          message: `🚨 *URGENT ESCALATION:* Request ${req.id.slice(0,8)} has been pending for ${Math.round(diffMinutes)} minutes with no driver acceptance!\n\nRoute: ${req.pickup_location} -> ${req.destination}\nTourist: ${req.tourist_name} (${req.tourist_whatsapp})`
        });
      }
      await supabase.from('transfer_requests').update({ admin_notified: true }).eq('id', req.id);
    }
  }
}
