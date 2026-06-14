import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://qmnpwinlvewbnjbruril.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbnB3aW5sdmV3Ym5qYnJ1cmlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg0Mjg5OSwiZXhwIjoyMDk0NDE4ODk5fQ.sstB1g-4tdFkmstcfj5xgpPidHFRHtYo7RqRTyw_Kn0';

const supabase = createClient(supabaseUrl, serviceKey, {
  realtime: { transport: ws },
});

async function seed() {
  console.log('Clearing existing data...');
  await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('trip_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('transfer_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('drivers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // ── Drivers ──────────────────────────────────────────
  const { data: ali } = await supabase.from('drivers').insert({
    full_name: 'Ali Hassan', email: 'ali@example.com', phone: '+255777123456', whatsapp: '+255777123456',
    vehicle_type: 'suv', vehicle_registration: 'T123 ABC',
    areas_covered: ['Abeid Amani Karume Airport', 'Stone Town', 'Paje', 'Nungwi', 'Kendwa'],
    status: 'approved', is_verified: true, rating: 4.8, total_trips: 45, total_earnings: 1125000,
  }).select().single();
  console.log('Driver: Ali Hassan (suv, approved)');

  const { data: fatima } = await supabase.from('drivers').insert({
    full_name: 'Fatima Salim', email: 'fatima@example.com', phone: '+255777654321', whatsapp: '+255777654321',
    vehicle_type: 'sedan', vehicle_registration: 'T456 DEF',
    areas_covered: ['Stone Town', 'Paje', 'Jambiani', 'Bwejuu', 'Abeid Amani Karume Airport'],
    status: 'approved', is_verified: true, rating: 4.9, total_trips: 78, total_earnings: 1950000,
  }).select().single();
  console.log('Driver: Fatima Salim (sedan, approved)');

  const { data: juma } = await supabase.from('drivers').insert({
    full_name: 'Juma Mkubwa', email: 'juma@example.com', phone: '+255777789012', whatsapp: '+255777789012',
    vehicle_type: 'minivan', vehicle_registration: 'T789 GHI',
    areas_covered: ['Abeid Amani Karume Airport', 'Nungwi', 'Kendwa', 'Kiwengwa'],
    status: 'approved', is_verified: true, rating: 4.2, total_trips: 12, total_earnings: 300000,
  }).select().single();
  console.log('Driver: Juma Mkubwa (minivan, approved)');

  const { data: pendingDriver } = await supabase.from('drivers').insert({
    full_name: 'Mwanaisha Hamad', email: 'mwanaisha@example.com', phone: '+255777555666', whatsapp: '+255777555666',
    vehicle_type: 'taxi', vehicle_registration: 'T012 JKL',
    areas_covered: ['Stone Town', 'Paje'],
    status: 'pending', is_verified: false, rating: 0, total_trips: 0, total_earnings: 0,
  }).select().single();
  console.log('Driver: Mwanaisha Hamad (taxi, pending)');

  // ── Transfer Requests ────────────────────────────────
  const { data: req1 } = await supabase.from('transfer_requests').insert({
    pickup_location: 'Abeid Amani Karume Airport', destination: 'Paje',
    pickup_date: '2026-06-15', pickup_time: '10:00', passengers: 2,
    tourist_name: 'Sarah Johnson', tourist_whatsapp: '+255777111111', tourist_email: 'sarah@example.com',
    special_notes: '2 large suitcases',
    status: 'completed',
  }).select().single();
  console.log('Request 1: Airport → Paje (completed)');

  const { data: req2 } = await supabase.from('transfer_requests').insert({
    pickup_location: 'Abeid Amani Karume Airport', destination: 'Nungwi',
    pickup_date: '2026-06-16', pickup_time: '14:30', passengers: 3,
    tourist_name: 'Markus Weber', tourist_whatsapp: '+255777222222', tourist_email: 'markus@example.com',
    special_notes: 'Need child seat for 3-year-old',
    status: 'in_progress',
  }).select().single();
  console.log('Request 2: Airport → Nungwi (in_progress)');

  const { data: req3 } = await supabase.from('transfer_requests').insert({
    pickup_location: 'Stone Town', destination: 'Paje',
    pickup_date: '2026-06-17', pickup_time: '08:00', passengers: 1,
    tourist_name: 'Emma Thompson', tourist_whatsapp: '+255777333333', tourist_email: 'emma@example.com',
    status: 'assigned',
  }).select().single();
  console.log('Request 3: Stone Town → Paje (assigned)');

  const { data: req4 } = await supabase.from('transfer_requests').insert({
    pickup_location: 'Abeid Amani Karume Airport', destination: 'Kendwa',
    pickup_date: '2026-06-18', pickup_time: '16:00', passengers: 4,
    tourist_name: 'Jean-Pierre Dubois', tourist_whatsapp: '+255777444444', tourist_email: 'jean@example.com',
    status: 'pending',
  }).select().single();
  console.log('Request 4: Airport → Kendwa (pending)');

  const { data: req5 } = await supabase.from('transfer_requests').insert({
    pickup_location: 'Nungwi', destination: 'Stone Town',
    pickup_date: '2026-06-19', pickup_time: '09:30', passengers: 2,
    tourist_name: 'Anna Schmidt', tourist_whatsapp: '+255777555555', tourist_email: 'anna@example.com',
    status: 'pending',
  }).select().single();
  console.log('Request 5: Nungwi → Stone Town (pending)');

  const { data: req6 } = await supabase.from('transfer_requests').insert({
    pickup_location: 'Paje', destination: 'Abeid Amani Karume Airport',
    pickup_date: '2026-06-14', pickup_time: '07:00', passengers: 2,
    tourist_name: 'Carlos Mendez', tourist_whatsapp: '+255777666666', tourist_email: 'carlos@example.com',
    status: 'completed',
  }).select().single();
  console.log('Request 6: Paje → Airport (completed)');

  // ── Trip Assignments ────────────────────────────────
  // Request 1 (completed) → Ali
  const { data: trip1 } = await supabase.from('trip_assignments').insert({
    request_id: req1.id, driver_id: ali.id,
    driver_name: ali.full_name, driver_phone: ali.phone, driver_whatsapp: ali.whatsapp,
    vehicle_type: ali.vehicle_type, vehicle_registration: ali.vehicle_registration,
    status: 'completed',
    accepted_at: '2026-06-15T09:00:00Z',
    started_at: '2026-06-15T10:00:00Z',
    completed_at: '2026-06-15T10:45:00Z',
  }).select().single();
  console.log('Trip 1: Ali → Sarah (completed)');

  // Request 2 (in_progress) → Fatima
  await supabase.from('trip_assignments').insert({
    request_id: req2.id, driver_id: fatima.id,
    driver_name: fatima.full_name, driver_phone: fatima.phone, driver_whatsapp: fatima.whatsapp,
    vehicle_type: fatima.vehicle_type, vehicle_registration: fatima.vehicle_registration,
    status: 'in_progress',
    accepted_at: '2026-06-16T13:00:00Z',
    started_at: '2026-06-16T14:30:00Z',
  }).select().single();
  console.log('Trip 2: Fatima → Markus (in_progress)');

  // Request 3 (assigned) → Juma
  await supabase.from('trip_assignments').insert({
    request_id: req3.id, driver_id: juma.id,
    driver_name: juma.full_name, driver_phone: juma.phone, driver_whatsapp: juma.whatsapp,
    vehicle_type: juma.vehicle_type, vehicle_registration: juma.vehicle_registration,
    status: 'assigned',
    accepted_at: '2026-06-16T20:00:00Z',
  }).select().single();
  console.log('Trip 3: Juma → Emma (assigned)');

  // Request 6 (completed) → Fatima
  const { data: trip6 } = await supabase.from('trip_assignments').insert({
    request_id: req6.id, driver_id: fatima.id,
    driver_name: fatima.full_name, driver_phone: fatima.phone, driver_whatsapp: fatima.whatsapp,
    vehicle_type: fatima.vehicle_type, vehicle_registration: fatima.vehicle_registration,
    status: 'completed',
    accepted_at: '2026-06-14T06:00:00Z',
    started_at: '2026-06-14T07:00:00Z',
    completed_at: '2026-06-14T07:30:00Z',
  }).select().single();
  console.log('Trip 6: Fatima → Carlos (completed)');

  // ── Reviews ─────────────────────────────────────────
  await supabase.from('reviews').insert({
    trip_id: trip1.id, driver_id: ali.id,
    rating: 5, comment: 'Ali was amazing! Very professional and arrived early. The SUV was clean and comfortable.',
  });
  console.log('Review: Sarah ⭐⭐⭐⭐⭐ for Ali');

  await supabase.from('reviews').insert({
    trip_id: trip6.id, driver_id: fatima.id,
    rating: 5, comment: 'Fatima is the best driver in Zanzibar! Very friendly and helpful.',
  });
  console.log('Review: Carlos ⭐⭐⭐⭐⭐ for Fatima');

  // Update driver stats with reviews
  await supabase.from('drivers').update({
    rating: 4.9, total_trips: 46, total_earnings: 1150000,
  }).eq('id', ali.id);

  await supabase.from('drivers').update({
    rating: 4.9, total_trips: 79, total_earnings: 1975000,
  }).eq('id', fatima.id);

  console.log('\n✅ Seed complete!');
  console.log('   Drivers: 4 (3 approved, 1 pending)');
  console.log('   Requests: 6 (2 completed, 1 in_progress, 1 assigned, 2 pending)');
  console.log('   Trips: 4 (2 completed, 1 in_progress, 1 assigned)');
  console.log('   Reviews: 2');
}

seed().catch(console.error);
