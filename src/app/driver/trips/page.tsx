'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Route, MapPin, Calendar, Loader2, PlayCircle, Flag, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DriverSidebar } from '@/components/driver/DriverSidebar';
import { createClient } from '@/lib/supabase/client';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

export default function DriverTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const fetchTrips = useCallback(async () => {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { router.push('/login'); return; }

    const { data: driver } = await supabase
      .from('drivers').select('*').eq('email', user.user.email).single();

    if (driver) {
      let query = supabase
        .from('trip_assignments')
        .select('*, transfer_requests!inner(*)')
        .eq('driver_id', driver.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      if (data) setTrips(data);
    }
    setLoading(false);
  }, [router, filter]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const handleStartTrip = async (tripId: string, requestId: string) => {
    setActionLoading(tripId);
    const supabase = createClient();
    await supabase.from('trip_assignments').update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
    }).eq('id', tripId);
    await supabase.from('transfer_requests').update({ status: 'in_progress' }).eq('id', requestId);
    setActionLoading(null);
    fetchTrips();
  };

  const handleCompleteTrip = async (tripId: string, requestId: string) => {
    setActionLoading(tripId);
    const supabase = createClient();
    await supabase.from('trip_assignments').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', tripId);
    await supabase.from('transfer_requests').update({ status: 'completed' }).eq('id', requestId);
    setActionLoading(null);
    fetchTrips();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pl-64 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <DriverSidebar />
      <div className="pl-64">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Trips</h1>
            <div className="flex gap-2">
              {['all', 'assigned', 'in_progress', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    filter === f
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {trips.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Route size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No trips found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {trips.map((trip: any) => {
                const req = trip.transfer_requests;
                return (
                  <Card key={trip.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <Badge className={getStatusColor(trip.status)}>{getStatusLabel(trip.status)}</Badge>
                          <div className="flex items-center gap-2 text-sm mt-2">
                            <MapPin size={14} className="text-primary shrink-0" />
                            <span className="font-medium">{req?.pickup_location || 'Unknown'}</span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="font-medium">{req?.destination || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>{req?.pickup_date} {req?.pickup_time}</span>
                            <span>{trip.vehicle_type} &mdash; {trip.vehicle_registration}</span>
                          </div>
                          {trip.status === 'completed' && trip.completed_at && (
                            <p className="text-xs text-slate-400 mt-1">Completed: {new Date(trip.completed_at).toLocaleString()}</p>
                          )}
                          {trip.status === 'in_progress' && trip.started_at && (
                            <p className="text-xs text-slate-400 mt-1">Started: {new Date(trip.started_at).toLocaleString()}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {trip.status === 'assigned' && (
                            <Button
                              size="sm"
                              className="gap-1"
                              onClick={() => handleStartTrip(trip.id, trip.request_id)}
                              loading={actionLoading === trip.id}
                            >
                              <PlayCircle size={14} />
                              {actionLoading === trip.id ? 'Starting...' : 'Start Trip'}
                            </Button>
                          )}
                          {trip.status === 'in_progress' && (
                            <Button
                              size="sm"
                              className="gap-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleCompleteTrip(trip.id, trip.request_id)}
                              loading={actionLoading === trip.id}
                            >
                              <Flag size={14} />
                              {actionLoading === trip.id ? 'Completing...' : 'Complete Trip'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
