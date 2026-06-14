'use client';

import { useEffect, useState, useCallback } from 'react';
import { DollarSign, Plus, Edit2, Trash2, Check, X, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { usdToTzs, DEFAULT_EXCHANGE_RATE } from '@/lib/utils';

export default function PricingAdminPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const [{ data: pricingData, error }, { data: settings }] = await Promise.all([
      supabase
        .from('route_pricing')
        .select('*')
        .order('pickup_location', { ascending: true }),
      supabase
        .from('settings')
        .select('exchange_rate')
        .limit(1)
        .single(),
    ]);

    if (error) {
      toast.error('Failed to fetch pricing');
    } else {
      setRoutes(pricingData || []);
    }

    if (settings?.exchange_rate) {
      setExchangeRate(settings.exchange_rate);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleUpdatePrice = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('route_pricing')
      .update({ price_usd: parseFloat(editPrice) })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update price');
    } else {
      toast.success('Price updated');
      setEditingId(null);
      fetchRoutes();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('route_pricing')
      .update({ active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      fetchRoutes();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Route Pricing</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">Exchange Rate: 1 USD = {exchangeRate.toLocaleString()} TZS</span>
          <Button onClick={fetchRoutes} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Pickup</th>
                  <th className="px-6 py-3 font-medium">Destination</th>
                  <th className="px-6 py-3 font-medium">Vehicle</th>
                  <th className="px-6 py-3 font-medium">Price (USD)</th>
                  <th className="px-6 py-3 font-medium">Price (TZS)</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-6 py-4 h-12 bg-slate-50/50 dark:bg-slate-800/20" />
                    </tr>
                  ))
                ) : (
                  routes.map((route) => (
                    <tr key={route.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{route.pickup_location}</td>
                      <td className="px-6 py-4">{route.destination}</td>
                      <td className="px-6 py-4 capitalize">{route.vehicle_type}</td>
                      <td className="px-6 py-4">
                        {editingId === route.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-20 h-8"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                            />
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600" onClick={() => handleUpdatePrice(route.id)}>
                              <Check size={16} />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => setEditingId(null)}>
                              <X size={16} />
                            </Button>
                          </div>
                        ) : (
                          <span className="font-bold text-primary">${route.price_usd}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {usdToTzs(route.price_usd, exchangeRate).toLocaleString()} TZS
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(route.id, route.active)}
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            route.active 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {route.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(route.id);
                            setEditPrice(route.price_usd.toString());
                          }}
                        >
                          <Edit2 size={14} className="mr-1" />
                          Edit
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
