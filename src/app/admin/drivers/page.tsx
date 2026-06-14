'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

export default function AdminDriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setDrivers(data);
      setLoading(false);
    };
    fetchDrivers();
  }, []);

  const handleApprove = async (id: string) => {
    const supabase = createClient();
    await supabase.from('drivers').update({ status: 'approved' }).eq('id', id);
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' } : d));
  };

  const handleReject = async (id: string) => {
    const supabase = createClient();
    await supabase.from('drivers').update({ status: 'rejected' }).eq('id', id);
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected' } : d));
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
      <AdminSidebar />
      <div className="pl-64">
        <div className="p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Manage Drivers</h1>

          {drivers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No drivers registered yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {drivers.map((driver) => (
                <Card key={driver.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold shrink-0">
                          {driver.full_name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{driver.full_name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{driver.email}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge className={getStatusColor(driver.status)}>{getStatusLabel(driver.status)}</Badge>
                            <span className="text-xs text-slate-400">{driver.vehicle_type} &mdash; {driver.vehicle_registration}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {driver.areas_covered?.map((area: string) => (
                              <Badge key={area} variant="info">{area}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {driver.status === 'pending' && (
                          <>
                            <Button size="sm" variant="primary" onClick={() => handleApprove(driver.id)}>
                              <CheckCircle size={14} className="mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleReject(driver.id)}>
                              <XCircle size={14} className="mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
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
