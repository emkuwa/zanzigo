
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, TrendingUp, Calendar, CheckCircle, Clock, Star, Share2, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DriverSidebar } from '@/components/driver/DriverSidebar';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function DriverEarningsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    earnings: 0,
    completed: 0,
    acceptanceRate: 0,
    avgRating: 0,
    referralCode: '',
    referralCount: 0
  });

  const fetchEarnings = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { router.push('/login'); return; }

    const { data: driver } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', userData.user.email)
      .single();

    if (driver) {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0,0,0,0)).toISOString();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        { count: today },
        { count: week },
        { count: month },
        { count: totalRequested },
        { count: referrals }
      ] = await Promise.all([
        supabase.from('trip_assignments').select('*', { count: 'exact', head: true }).eq('driver_id', driver.id).eq('status', 'completed').gte('completed_at', startOfDay),
        supabase.from('trip_assignments').select('*', { count: 'exact', head: true }).eq('driver_id', driver.id).eq('status', 'completed').gte('completed_at', startOfWeek),
        supabase.from('trip_assignments').select('*', { count: 'exact', head: true }).eq('driver_id', driver.id).eq('status', 'completed').gte('completed_at', startOfMonth),
        supabase.from('notification_logs').select('*', { count: 'exact', head: true }).eq('driver_id', driver.id),
        supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('referred_by_id', driver.id)
      ]);

      const acceptanceRate = totalRequested ? (driver.total_trips / totalRequested) * 100 : 0;

      setStats({
        today: today || 0,
        week: week || 0,
        month: month || 0,
        earnings: driver.total_earnings,
        completed: driver.total_trips,
        acceptanceRate: acceptanceRate,
        avgRating: driver.rating,
        referralCode: driver.referral_code,
        referralCount: referrals || 0
      });
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchEarnings(); }, [fetchEarnings]);

  const copyReferral = () => {
    navigator.clipboard.writeText(stats.referralCode);
    toast.success('Referral code copied!');
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Earnings & Performance</h1>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="bg-primary text-white">
              <CardContent className="pt-6">
                <p className="text-primary-foreground/80 text-sm">Total Earnings</p>
                <p className="text-3xl font-bold mt-1">TSh {stats.earnings.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-primary-foreground/60">
                  <TrendingUp size={14} />
                  <span>Paid directly by tourists</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Trips Today</p>
                <p className="text-3xl font-bold mt-1">{stats.today}</p>
                <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                  <CheckCircle size={12} /> Keep it up!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</p>
                  <Star size={24} className="text-yellow-500" fill="currentColor" />
                </div>
                <p className="text-xs text-slate-400 mt-2">Based on {stats.completed} reviews</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Acceptance Rate</span>
                    <span className="text-sm font-bold text-primary">{stats.acceptanceRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${stats.acceptanceRate}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Trips This Week</p>
                    <p className="text-xl font-bold">{stats.week}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Trips This Month</p>
                    <p className="text-xl font-bold">{stats.month}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 size={20} className="text-primary" />
                  Referral Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Invite other drivers to ZanziGo and earn bonuses for every active driver you refer.
                </p>
                <div className="bg-white dark:bg-slate-900 border border-primary/20 rounded-lg p-4 flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your Referral Code</p>
                    <p className="text-xl font-mono font-bold text-primary">{stats.referralCode}</p>
                  </div>
                  <Button onClick={copyReferral} size="sm">Copy Code</Button>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <Users size={16} className="text-primary" />
                    <span>{stats.referralCount} Referred Drivers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
