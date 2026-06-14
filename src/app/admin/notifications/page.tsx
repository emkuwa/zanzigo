
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { formatDate, formatDateTime, getStatusColor, cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function NotificationsAdminPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    
    let query = supabase
      .from('notification_logs')
      .select('*, drivers(full_name), transfer_requests(pickup_location, destination)')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to fetch notification logs');
      console.error(error);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResend = async (logId: string) => {
    setResendingId(logId);
    try {
      const response = await fetch('/api/admin/notifications/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Notification resent successfully');
        fetchLogs();
      } else {
        toast.error(result.error || 'Failed to resend notification');
      }
    } catch (error) {
      toast.error('An error occurred while resending');
    } finally {
      setResendingId(null);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.recipient_whatsapp.includes(searchTerm) || 
    log.drivers?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.transfer_requests?.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.transfer_requests?.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Notification Logs</h1>
        <Button onClick={fetchLogs} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by driver, phone, or location..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-900"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Recipient</th>
                  <th className="px-6 py-3 font-medium">Request</th>
                  <th className="px-6 py-3 font-medium">Message</th>
                  <th className="px-6 py-3 font-medium">Provider</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Sent At</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-6 py-4 h-16 bg-slate-50/50 dark:bg-slate-800/20" />
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No notification logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {log.drivers?.full_name || 'Unknown Driver'}
                        </div>
                        <div className="text-xs text-slate-500">{log.recipient_whatsapp}</div>
                      </td>
                      <td className="px-6 py-4">
                        {log.transfer_requests ? (
                          <div className="text-xs">
                            <span className="font-medium">{log.transfer_requests.pickup_location}</span>
                            <span className="mx-1">→</span>
                            <span className="font-medium">{log.transfer_requests.destination}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs max-w-xs truncate" title={log.message}>
                          {log.message}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="default" className="capitalize text-[10px]">
                          {log.provider.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className={cn("text-xs capitalize", 
                            log.status === 'failed' ? "text-red-500" : 
                            log.status === 'sent' ? "text-green-500" : "text-slate-500"
                          )}>
                            {log.status}
                          </span>
                        </div>
                        {log.error_message && (
                          <div className="text-[10px] text-red-400 mt-1 max-w-[150px] truncate" title={log.error_message}>
                            {log.error_message}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {log.sent_at ? formatDateTime(log.sent_at) : 'Not sent'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResend(log.id)}
                          disabled={resendingId === log.id}
                          className="h-8 w-8 p-0"
                        >
                          <RefreshCw className={cn("h-4 w-4", resendingId === log.id && "animate-spin")} />
                          <span className="sr-only">Resend</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
