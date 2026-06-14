import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://qmnpwinlvewbnjbruril.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbnB3aW5sdmV3Ym5qYnJ1cmlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg0Mjg5OSwiZXhwIjoyMDk0NDE4ODk5fQ.sstB1g-4tdFkmstcfj5xgpPidHFRHtYo7RqRTyw_Kn0';

const supabase = createClient(supabaseUrl, serviceKey, {
  realtime: { transport: ws },
});

async function seed() {
  // Clear existing data
  const { error: clear1 } = await supabase.from('trip_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (clear1) console.error('Clear trip_assignments error:', clear1.message);
  const { error: clear2 } = await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (clear2) console.error('Clear reviews error:', clear2.message);
  const { error: clear3 } = await supabase.from('transfer_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (clear3) console.error('Clear transfer_requests error:', clear3.message);
  const { error: clear4 } = await supabase.from('drivers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (clear4) console.error('Clear drivers error:', clear4.message);

  console.log('Cleared existing data');

  // Seed transfer requests
  const requests = [
    { pickup_location: 'Abeid Amani Karume Airport', destination: 'Paje', pickup_date: '2026-06-15', pickup_time: '10:00', passengers: 2, tourist_name: 'Sarah Johnson', tourist_whatsapp: '+255777111111', tourist_email: 'sarah@example.com', status: 'completed' },
    { pickup_location: 'Abeid Amani Karume Airport', destination: 'Nungwi', pickup_date: '2026-06-16', pickup_time: '14:30', passengers: 3, tourist_name: 'Markus Weber', tourist_whatsapp: '+255777222222', tourist_email: 'markus@example.com', status: 'assigned' },
    { pickup_location: 'Stone Town', destination: 'Paje', pickup_date: '2026-06-17', pickup_time: '08:00', passengers: 1, tourist_name: 'Emma Thompson', tourist_whatsapp: '+255777333333', tourist_email: 'emma@example.com', status: 'pending' },
    { pickup_location: 'Abeid Amani Karume Airport', destination: 'Kendwa', pickup_date: '2026-06-18', pickup_time: '16:00', passengers: 4, tourist_name: 'Jean-Pierre Dubois', tourist_whatsapp: '+255777444444', tourist_email: 'jean@example.com', status: 'pending' },
  ];

  for (const req of requests) {
    const { data, error } = await supabase.from('transfer_requests').insert(req).select();
    if (error) console.error('Request error:', error.message);
    else console.log('Created request:', data[0].pickup_location, '->', data[0].destination);
  }

  // Seed drivers
  const drivers = [
    { full_name: 'Ali Hassan', email: 'ali@example.com', phone: '+255777123456', whatsapp: '+255777123456', vehicle_type: 'suv', vehicle_registration: 'T123 ABC', areas_covered: ['Abeid Amani Karume Airport', 'Stone Town', 'Paje', 'Nungwi'], status: 'approved', is_verified: true, rating: 4.8, total_trips: 45, total_earnings: 1125000 },
    { full_name: 'Fatima Salim', email: 'fatima@example.com', phone: '+255777654321', whatsapp: '+255777654321', vehicle_type: 'sedan', vehicle_registration: 'T456 DEF', areas_covered: ['Stone Town', 'Paje', 'Jambiani', 'Bwejuu'], status: 'approved', is_verified: true, rating: 4.9, total_trips: 78, total_earnings: 1950000 },
    { full_name: 'Juma Mkubwa', email: 'juma@example.com', phone: '+255777789012', whatsapp: '+255777789012', vehicle_type: 'minivan', vehicle_registration: 'T789 GHI', areas_covered: ['Abeid Amani Karume Airport', 'Nungwi', 'Kendwa', 'Kiwengwa'], status: 'pending', is_verified: false, rating: 0, total_trips: 0, total_earnings: 0 },
  ];

  for (const driver of drivers) {
    const { data, error } = await supabase.from('drivers').insert(driver).select();
    if (error) console.error('Driver error:', error.message);
    else console.log('Created driver:', data[0].full_name, '(' + data[0].vehicle_type + ')');
  }

  console.log('\nSeeding complete!');
}

seed().catch(console.error);
