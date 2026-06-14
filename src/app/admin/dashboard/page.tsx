'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, ClipboardList, Route, CheckCircle, DollarSign, TrendingUp, Loader2, MapPin, Star, Clock, ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { Download, Award, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [routePerformance, setRoutePerformance] = useState<any[]>([]);
  const [seasonRevenue, setSeasonRevenue] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    unassignedAlerts: 0,
    avgTimeToAssign: 0,
    completionRate: 0,
    acceptanceRate: 0,
    avgResponseTime: 0,
    conversionRate: 0,
    revenue: 0,
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) { router.push('/login'); return; }

      const [
        { count: totalRequests },
        { count: pendingRequests },
        { count: unassignedAlerts },
        { count: completedTrips },
        { count: formSubmits },
        { count: formOpens },
        { data: reqs },
        { data: driverData },
        { data: completedTripsData },
      ] = await Promise.all([
        supabase.from('transfer_requests').select('*', { count: 'exact', head: true }),
        supabase.from('transfer_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('transfer_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending').eq('backup_notified', true),
        supabase.from('trip_assignments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'form_submit'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'form_open'),
        supabase.from('transfer_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
        supabase.from('drivers').select('*').eq('status', 'approved').order('rating', { ascending: false }).limit(5),
        supabase.from('transfer_requests').select('price_quoted, season_multiplier, pickup_location, destination').eq('status', 'completed'),
      ]);

      const completionRate = totalRequests ? ((completedTrips || 0) / totalRequests) * 100 : 0;
      const assignedRequests = (totalRequests || 0) - (pendingRequests || 0);
      const acceptanceRate = totalRequests ? (assignedRequests / totalRequests) * 100 : 0;
      const conversionRate = formOpens ? (formSubmits || 0) / formOpens * 100 : 0;

      const actualRevenue = completedTripsData
        ? completedTripsData.reduce((sum: number, trip: any) => sum + (trip.price_quoted || 0), 0)
        : (completedTrips || 0) * 15;

      // Calculate season breakdown
      const seasonMap: Record<string, { revenue: number; bookings: number }> = {};
      (completedTripsData || []).forEach((trip: any) => {
        let seasonName = 'Low Season';
        const mult = trip.season_multiplier || 1.0;
        if (mult >= 1.15) seasonName = 'Peak Season';
        else if (mult > 1.0) seasonName = 'High Season';

        if (!seasonMap[seasonName]) {
          seasonMap[seasonName] = { revenue: 0, bookings: 0 };
        }
        seasonMap[seasonName].revenue += trip.price_quoted || 0;
        seasonMap[seasonName].bookings += 1;
      });

      const seasonData = Object.entries(seasonMap).map(([name, data]) => ({
        season: name,
        revenue: data.revenue,
        bookings: data.bookings,
        avgValue: data.bookings > 0 ? Math.round(data.revenue / data.bookings) : 0,
      }));

      setStats({
        totalRequests: totalRequests || 0,
        pendingRequests: pendingRequests || 0,
        unassignedAlerts: unassignedAlerts || 0,
        avgTimeToAssign: 0,
        completionRate,
        acceptanceRate,
        avgResponseTime: 0,
        conversionRate,
        revenue: actualRevenue,
      });

      if (reqs) setPendingRequests(reqs);
      if (driverData) setDrivers(driverData);
      setSeasonRevenue(seasonData);
      setLoading(false);
    };
    fetchStats();
  }, [router]);

  const handleExport = async (type: string) => {
    setExporting(true);
    try {
      window.location.href = `/api/admin/export?type=${type}`;
      toast.success('Export started');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pl-64 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: 'Unassigned Alerts', value: stats.unassignedAlerts, icon: ClipboardList, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    { label: 'SLA (Avg Response)', value: `${stats.avgResponseTime.toFixed(1)}m`, icon: Clock, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
    { label: 'Completion Rate', value: `${stats.completionRate.toFixed(1)}%`, icon: CheckCircle, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { label: 'Acceptance Rate', value: `${stats.acceptanceRate.toFixed(1)}%`, icon: TrendingUp, color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
    { label: 'Conversion', value: `${stats.conversionRate.toFixed(1)}%`, icon: CheckCircle, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
    { label: 'Revenue (Total)', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <AdminSidebar />
      <div className="pl-64">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('requests')} disabled={exporting}>
                <Download size={16} />
                Export Requests
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('drivers')} disabled={exporting}>
                <Download size={16} />
                Export Drivers
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`rounded-lg p-3 ${stat.color}`}>
                      <stat.icon size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Requests</CardTitle>
                  <Link href="/admin/requests" className="text-xs text-primary hover:underline flex items-center gap-1">
                    View All <ArrowRight size={12} />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                    <ClipboardList size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm">No pending requests.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 font-medium">
                            <MapPin size={12} className="text-primary shrink-0" />
                            <span>{req.pickup_location}</span>
                            <span className="text-slate-400">&rarr;</span>
                            <span>{req.destination}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {req.tourist_name} &bull; {req.pickup_date} {req.pickup_time}
                          </p>
                        </div>
                        <Badge variant="warning">{req.passengers} pax</Badge>
                        <Link href={`/admin/requests`}>
                          <Button size="sm" variant="outline" className="ml-2">Manage</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Driver Leaderboard */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award size={18} className="text-yellow-500" />
                    Driver Leaderboard
                  </CardTitle>
                  <Link href="/admin/drivers" className="text-xs text-primary hover:underline flex items-center gap-1">
                    View All <ArrowRight size={12} />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                    <Users size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm">No approved drivers yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((driver, index) => (
                      <div key={driver.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'} flex items-center justify-center text-xs font-bold shrink-0`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{driver.full_name}</p>
                            <p className="text-xs text-slate-500">{driver.total_trips} trips</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500 text-sm">
                          <Star size={14} fill="currentColor" />
                          <span className="font-medium text-slate-900 dark:text-white">{driver.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Season Revenue Analytics */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  Revenue by Season
                </CardTitle>
                <Link href="/admin/seasons" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Manage Seasons <ArrowRight size={12} />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {seasonRevenue.length === 0 ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                  <Calendar size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm">No completed trips yet. Season analytics will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {seasonRevenue.map((season) => {
                    const colorMap: Record<string, string> = {
                      'Low Season': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                      'High Season': 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
                      'Peak Season': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                    };
                    const textColorMap: Record<string, string> = {
                      'Low Season': 'text-green-700 dark:text-green-400',
                      'High Season': 'text-amber-700 dark:text-amber-400',
                      'Peak Season': 'text-red-700 dark:text-red-400',
                    };
                    return (
                      <div key={season.season} className={`rounded-lg border p-4 ${colorMap[season.season] || 'bg-slate-50 dark:bg-slate-800/20'}`}>
                        <p className={`font-semibold ${textColorMap[season.season] || 'text-slate-700 dark:text-slate-300'}`}>{season.season}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">${season.revenue.toLocaleString()}</p>
                        <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                          <p>{season.bookings} bookings</p>
                          <p>Avg: ${season.avgValue.toLocaleString()} / trip</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Routes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapIcon size={18} className="text-primary" />
                Top Performing Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                <Route size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm">Route data will appear after completed trips.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
