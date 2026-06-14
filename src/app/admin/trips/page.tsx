'use client';

import { useEffect, useState } from 'react';
import { Route, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { getStatusColor, getStatusLabel, formatDateTime } from '@/lib/utils';

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('trip_assignments')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setTrips(data);
      setLoading(false);
    };
    fetchTrips();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pl-64 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <AdminSidebar />
      <div className="pl-64">
        <div className="p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">All Trips</h1>

          {trips.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Route size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No trips yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {trips.map((trip: any) => (
                <Card key={trip.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(trip.status)}>{getStatusLabel(trip.status)}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Driver: {trip.driver_name}</p>
                          <p className="text-xs text-slate-500">{trip.vehicle_type} &mdash; {trip.vehicle_registration}</p>
                          <p className="text-xs text-slate-400">
                            Created: {formatDateTime(trip.created_at)}
                          </p>
                          {trip.completed_at && (
                            <p className="text-xs text-slate-400">Completed: {formatDateTime(trip.completed_at)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
