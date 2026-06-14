'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, CheckCircle, Clock, Wallet, Loader2, MapPin, Calendar, Route, PlayCircle, Flag, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DriverSidebar } from '@/components/driver/DriverSidebar';
import { createClient } from '@/lib/supabase/client';
import { TransferRequest } from '@/lib/types';
import { getStatusColor, getStatusLabel, cn } from '@/lib/utils';

export default function DriverDashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [availability, setAvailability] = useState<'online' | 'offline' | 'busy'>('offline');
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push('/login');
      return;
    }

    const { data: driverData } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', userData.user.email)
      .single();

    if (driverData) {
      setAvailability(driverData.availability_status);
      const { data: reqs } = await supabase
        .from('transfer_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      if (reqs) setRequests(reqs);

      const { data: trips } = await supabase
        .from('trip_assignments')
        .select('*, transfer_requests!inner(*)')
        .eq('driver_id', driverData.id)
        .order('created_at', { ascending: false });

      if (trips) setMyTrips(trips);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleAvailability = async (newStatus: 'online' | 'offline' | 'busy') => {
    setUpdatingAvailability(true);
    try {
      const res = await fetch('/api/drivers/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAvailability(newStatus);
      }
    } catch (err) {
      console.error('Failed to update availability:', err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    setActionLoading(requestId);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { data: driverData } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', userData.user?.email)
      .single();

    if (!driverData) return;

    await supabase.from('trip_assignments').insert({
      request_id: requestId,
      driver_id: driverData.id,
      driver_name: driverData.full_name,
      driver_phone: driverData.phone,
      driver_whatsapp: driverData.whatsapp,
      vehicle_type: driverData.vehicle_type,
      vehicle_registration: driverData.vehicle_registration,
      status: 'assigned',
      accepted_at: new Date().toISOString(),
    });

    await supabase
      .from('transfer_requests')
      .update({ status: 'assigned' })
      .eq('id', requestId);

    setRequests(prev => prev.filter(r => r.id !== requestId));
    setActionLoading(null);
    fetchData();
  };

  const handleStartTrip = async (tripId: string) => {
    setActionLoading(tripId);
    const supabase = createClient();
    await supabase.from('trip_assignments').update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
    }).eq('id', tripId);

    await supabase.from('transfer_requests').update({ status: 'in_progress' }).eq('id',
      myTrips.find(t => t.id === tripId)?.request_id
    );
    setActionLoading(null);
    fetchData();
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
    fetchData();
  };

  const stats = {
    total: myTrips.length,
    active: myTrips.filter((t: any) => t.status === 'assigned' || t.status === 'in_progress').length,
    completed: myTrips.filter((t: any) => t.status === 'completed').length,
    earnings: myTrips.filter((t: any) => t.status === 'completed').length * 25000,
  };

  const assignedTrips = myTrips.filter((t: any) => t.status === 'assigned');
  const inProgressTrips = myTrips.filter((t: any) => t.status === 'in_progress');
  const completedTrips = myTrips.filter((t: any) => t.status === 'completed');

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Driver Dashboard</h1>
            
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
              <button
                onClick={() => handleToggleAvailability('online')}
                disabled={updatingAvailability}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  availability === 'online' 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" 
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                Online
              </button>
              <button
                onClick={() => handleToggleAvailability('busy')}
                disabled={updatingAvailability}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  availability === 'busy' 
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" 
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                Busy
              </button>
              <button
                onClick={() => handleToggleAvailability('offline')}
                disabled={updatingAvailability}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  availability === 'offline' 
                    ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" 
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                Offline
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Available Requests</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{requests.length}</p>
                  </div>
                  <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3 text-blue-600 dark:text-blue-400">
                    <ClipboardList size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Active Trips</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</p>
                  </div>
                  <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-green-600 dark:text-green-400">
                    <Clock size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed}</p>
                  </div>
                  <div className="rounded-lg bg-teal-100 dark:bg-teal-900/30 p-3 text-teal-600 dark:text-teal-400">
                    <CheckCircle size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Estimated Earnings</p>
                    <p className="text-2xl font-bold text-primary">TSh {stats.earnings.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3 text-amber-600 dark:text-amber-400">
                    <Wallet size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Transfer Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <ClipboardList size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    <p>No transfer requests available.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((req) => (
                      <div key={req.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin size={14} className="text-primary shrink-0" />
                              <span className="font-medium">{req.pickup_location}</span>
                              <span className="text-slate-400">&rarr;</span>
                              <span className="font-medium">{req.destination}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><Calendar size={12} />{req.pickup_date} {req.pickup_time}</span>
                            </div>
                            <p className="text-xs text-slate-400">{req.tourist_name} &bull; {req.passengers} passenger{req.passengers > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => handleAccept(req.id)}
                          loading={actionLoading === req.id}
                        >
                          {actionLoading === req.id ? 'Accepting...' : 'Accept Request'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {assignedTrips.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-600">
                      <Clock size={18} />
                      Waiting to Start
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {assignedTrips.slice(0, 5).map((trip: any) => {
                        const req = trip.transfer_requests;
                        return (
                          <div key={trip.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="text-sm">
                                <div className="flex items-center gap-2 font-medium">
                                  <MapPin size={14} className="text-primary shrink-0" />
                                  <span>{req?.pickup_location || 'Unknown'}</span>
                                  <span className="text-slate-400">&rarr;</span>
                                  <span>{req?.destination || 'Unknown'}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{trip.vehicle_type} &mdash; {trip.vehicle_registration}</p>
                              </div>
                              <Button
                                size="sm"
                                className="gap-1"
                                onClick={() => handleStartTrip(trip.id)}
                                loading={actionLoading === trip.id}
                              >
                                <PlayCircle size={14} />
                                {actionLoading === trip.id ? 'Starting...' : 'Start Trip'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {inProgressTrips.length > 0 && (
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-600">
                      <Route size={18} />
                      In Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {inProgressTrips.slice(0, 5).map((trip: any) => {
                        const req = trip.transfer_requests;
                        return (
                          <div key={trip.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="text-sm">
                                <div className="flex items-center gap-2 font-medium">
                                  <MapPin size={14} className="text-primary shrink-0" />
                                  <span>{req?.pickup_location || 'Unknown'}</span>
                                  <span className="text-slate-400">&rarr;</span>
                                  <span>{req?.destination || 'Unknown'}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{trip.vehicle_type} &mdash; {trip.vehicle_registration}</p>
                              </div>
                              <Button
                                size="sm"
                                className="gap-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleCompleteTrip(trip.id, trip.request_id)}
                                loading={actionLoading === trip.id}
                              >
                                <Flag size={14} />
                                {actionLoading === trip.id ? 'Completing...' : 'Complete Trip'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {completedTrips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-500" />
                      Recent Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {completedTrips.slice(0, 5).map((trip: any) => {
                        const req = trip.transfer_requests;
                        return (
                          <div key={trip.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                                <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{req?.pickup_location || 'Unknown'} &rarr; {req?.destination || 'Unknown'}</p>
                                <p className="text-xs text-slate-500">{trip.vehicle_type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500 text-xs">
                              <Star size={12} fill="currentColor" />
                              <span>pending</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {assignedTrips.length === 0 && inProgressTrips.length === 0 && completedTrips.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Route size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500 dark:text-slate-400">No trips yet. Accept a request to get started.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
