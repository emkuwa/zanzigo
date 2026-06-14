'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, MapPin, Calendar, Clock, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { TransferRequest } from '@/lib/types';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('transfer_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setRequests(data);
      setLoading(false);
    };
    fetchRequests();
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Transfer Requests</h1>

          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardList size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No transfer requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-2">
                        <Badge className={getStatusColor(req.status)}>{getStatusLabel(req.status)}</Badge>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className="text-primary" />
                          <span className="font-medium">{req.pickup_location}</span>
                          <span className="text-slate-400">&rarr;</span>
                          <span className="font-medium">{req.destination}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Calendar size={12} />{req.pickup_date}</span>
                          <span className="flex items-center gap-1"><Clock size={12} />{req.pickup_time}</span>
                          <span className="flex items-center gap-1"><Users size={12} />{req.passengers} passenger{req.passengers > 1 ? 's' : ''}</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {req.tourist_name} &bull; {req.tourist_whatsapp} &bull; {req.tourist_email}
                        </p>
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
