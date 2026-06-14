import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const { data: trip } = await supabase
      .from('trip_assignments')
      .select('driver_id, status')
      .eq('id', id)
      .single();

    if (!trip || trip.status !== 'completed') {
      return NextResponse.json({ error: 'Trip not found or not completed' }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('trip_id', id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Review already submitted' }, { status: 409 });
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        trip_id: id,
        driver_id: trip.driver_id,
        rating,
        comment: comment || null,
      })
      .select()
      .single();

    if (error) throw error;

    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('driver_id', trip.driver_id);

    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : rating;

    await supabase
      .from('drivers')
      .update({
        rating: Math.round(avgRating * 10) / 10,
        total_trips: reviews?.length || 1,
      })
      .eq('id', trip.driver_id);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
