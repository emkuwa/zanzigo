import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    // Seed popular routes as transfer requests
    const sampleRequests = [
      {
        pickup_location: 'Abeid Amani Karume Airport',
        destination: 'Paje',
        pickup_date: '2026-06-15',
        pickup_time: '10:00',
        passengers: 2,
        tourist_name: 'Sarah Johnson',
        tourist_whatsapp: '+255777111111',
        tourist_email: 'sarah@example.com',
        status: 'completed',
      },
      {
        pickup_location: 'Abeid Amani Karume Airport',
        destination: 'Nungwi',
        pickup_date: '2026-06-16',
        pickup_time: '14:30',
        passengers: 3,
        tourist_name: 'Markus Weber',
        tourist_whatsapp: '+255777222222',
        tourist_email: 'markus@example.com',
        status: 'assigned',
      },
      {
        pickup_location: 'Stone Town',
        destination: 'Paje',
        pickup_date: '2026-06-17',
        pickup_time: '08:00',
        passengers: 1,
        tourist_name: 'Emma Thompson',
        tourist_whatsapp: '+255777333333',
        tourist_email: 'emma@example.com',
        status: 'pending',
      },
      {
        pickup_location: 'Abeid Amani Karume Airport',
        destination: 'Kendwa',
        pickup_date: '2026-06-18',
        pickup_time: '16:00',
        passengers: 4,
        tourist_name: 'Jean-Pierre Dubois',
        tourist_whatsapp: '+255777444444',
        tourist_email: 'jean@example.com',
        status: 'pending',
      },
    ];

    for (const req of sampleRequests) {
      await supabase.from('transfer_requests').insert(req);
    }

    // Seed Route Pricing (2026 market rates)
    const pricingData = [
      // Airport routes
      { pickup: 'Abeid Amani Karume Airport', destination: 'Stone Town', price: 15 },
      { pickup: 'Abeid Amani Karume Airport', destination: 'Paje', price: 35 },
      { pickup: 'Abeid Amani Karume Airport', destination: 'Jambiani', price: 35 },
      { pickup: 'Abeid Amani Karume Airport', destination: 'Bwejuu', price: 35 },
      { pickup: 'Abeid Amani Karume Airport', destination: 'Michamvi', price: 40 },
      { pickup: 'Abeid Amani Karume Airport', destination: 'Kizimkazi', price: 40 },
      { pickup: 'Abeid Amani Karume Airport', destination: 'Nungwi', price: 50 },
      { pickup: 'Abeid Amani Karume Airport', destination: 'Kendwa', price: 50 },
      // Stone Town routes
      { pickup: 'Stone Town', destination: 'Abeid Amani Karume Airport', price: 15 },
      { pickup: 'Stone Town', destination: 'Paje', price: 35 },
      { pickup: 'Stone Town', destination: 'Jambiani', price: 35 },
      { pickup: 'Stone Town', destination: 'Bwejuu', price: 35 },
      { pickup: 'Stone Town', destination: 'Michamvi', price: 40 },
      { pickup: 'Stone Town', destination: 'Nungwi', price: 50 },
      { pickup: 'Stone Town', destination: 'Kendwa', price: 50 },
      // Paje routes
      { pickup: 'Paje', destination: 'Jambiani', price: 15 },
      { pickup: 'Paje', destination: 'Bwejuu', price: 15 },
      { pickup: 'Paje', destination: 'Michamvi', price: 25 },
      { pickup: 'Paje', destination: 'Nungwi', price: 60 },
      { pickup: 'Paje', destination: 'Kendwa', price: 60 },
      // Jambiani routes
      { pickup: 'Jambiani', destination: 'Nungwi', price: 65 },
      { pickup: 'Jambiani', destination: 'Kendwa', price: 65 },
      // Bwejuu routes
      { pickup: 'Bwejuu', destination: 'Nungwi', price: 60 },
      { pickup: 'Bwejuu', destination: 'Kendwa', price: 60 },
      // Michamvi routes
      { pickup: 'Michamvi', destination: 'Nungwi', price: 70 },
      { pickup: 'Michamvi', destination: 'Kendwa', price: 70 },
    ];

    for (const p of pricingData) {
      await supabase.from('route_pricing').upsert({
        pickup_location: p.pickup,
        destination: p.destination,
        vehicle_type: 'sedan',
        price_usd: p.price,
        active: true
      }, { onConflict: 'pickup_location,destination,vehicle_type' });
    }

    // Seed sample drivers
    const sampleDrivers = [
      {
        full_name: 'Ali Hassan',
        email: 'ali@example.com',
        phone: '+255777123456',
        whatsapp: '+255777123456',
        vehicle_type: 'suv',
        vehicle_registration: 'T123 ABC',
        areas_covered: ['Abeid Amani Karume Airport', 'Stone Town', 'Paje', 'Nungwi'],
        status: 'approved',
        availability_status: 'online',
        is_verified: true,
        rating: 4.8,
        total_trips: 45,
        total_earnings: 1125000,
      },
      {
        full_name: 'Fatima Salim',
        email: 'fatima@example.com',
        phone: '+255777654321',
        whatsapp: '+255777654321',
        vehicle_type: 'sedan',
        vehicle_registration: 'T456 DEF',
        areas_covered: ['Stone Town', 'Paje', 'Jambiani', 'Bwejuu'],
        status: 'approved',
        availability_status: 'online',
        is_verified: true,
        rating: 4.9,
        total_trips: 78,
        total_earnings: 1950000,
      },
      {
        full_name: 'Juma Mkubwa',
        email: 'juma@example.com',
        phone: '+255777789012',
        whatsapp: '+255777789012',
        vehicle_type: 'minivan',
        vehicle_registration: 'T789 GHI',
        areas_covered: ['Abeid Amani Karume Airport', 'Nungwi', 'Kendwa', 'Kiwengwa'],
        status: 'pending',
        availability_status: 'offline',
        is_verified: false,
        rating: 0,
        total_trips: 0,
        total_earnings: 0,
      },
    ];

    for (const driver of sampleDrivers) {
      const { data } = await supabase.from('drivers').insert(driver).select().single();
      if (data && driver.total_trips > 0 && driver.rating > 0) {
        // Create sample completed trip for this driver
        await supabase.from('trip_assignments').insert({
          request_id: (await supabase.from('transfer_requests').select('id').limit(1).single()).data?.id,
          driver_id: data.id,
          driver_name: data.full_name,
          driver_phone: data.phone,
          driver_whatsapp: data.whatsapp,
          vehicle_type: data.vehicle_type,
          vehicle_registration: data.vehicle_registration,
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to seed data' },
      { status: 500 }
    );
  }
}
