
import { createServerSupabase } from '@/lib/supabase/server';
import { sendWhatsAppNotification } from '@/lib/notifications';

export async function sendWeeklySummaries() {
  const supabase = await createServerSupabase();
  
  // Get all approved drivers
  const { data: drivers } = await supabase
    .from('drivers')
    .select('*')
    .eq('status', 'approved');

  if (!drivers) return;

  const now = new Date();
  const lastWeek = new Date(now.setDate(now.getDate() - 7)).toISOString();

  for (const driver of drivers) {
    // Get trips from last week
    const { count: weeklyTrips } = await supabase
      .from('trip_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('driver_id', driver.id)
      .eq('status', 'completed')
      .gte('completed_at', lastWeek);

    const message = `📊 *Your ZanziGo Weekly Summary*

Trips Completed: ${weeklyTrips || 0}
Average Rating: ${driver.rating.toFixed(1)} ⭐
Estimated Earnings: TSh ${((weeklyTrips || 0) * 25000).toLocaleString()}

Keep up the great work! Open your dashboard to see more:
${process.env.NEXT_PUBLIC_APP_URL}/driver/earnings`;

    await sendWhatsAppNotification({
      requestId: 'system',
      driverId: driver.id,
      phone: driver.whatsapp,
      message: message
    });
  }
}
