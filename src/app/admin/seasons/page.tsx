'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, Plus, Edit2, Trash2, Check, X, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Season {
  id: string;
  name: string;
  multiplier: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export default function SeasonsAdminPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', multiplier: '', start_date: '', end_date: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', multiplier: '1.0', start_date: '', end_date: '' });

  const fetchSeasons = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      toast.error('Failed to fetch seasons');
    } else {
      setSeasons(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const handleCreate = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error('Please fill all fields');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('seasons').insert({
      name: formData.name,
      multiplier: parseFloat(formData.multiplier),
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: true,
    });

    if (error) {
      toast.error('Failed to create season');
    } else {
      toast.success('Season created');
      setFormData({ name: '', multiplier: '1.0', start_date: '', end_date: '' });
      setShowForm(false);
      fetchSeasons();
    }
  };

  const handleUpdate = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('seasons')
      .update({
        name: editData.name,
        multiplier: parseFloat(editData.multiplier),
        start_date: editData.start_date,
        end_date: editData.end_date,
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update season');
    } else {
      toast.success('Season updated');
      setEditingId(null);
      fetchSeasons();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this season?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('seasons').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete season');
    } else {
      toast.success('Season deleted');
      fetchSeasons();
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('seasons')
      .update({ is_active: !current })
      .eq('id', id);

    if (error) {
      toast.error('Failed to toggle season');
    } else {
      fetchSeasons();
    }
  };

  const getMultiplierColor = (m: number) => {
    if (m <= 1.0) return 'text-green-600 dark:text-green-400';
    if (m <= 1.1) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getMultiplierLabel = (m: number) => {
    if (m <= 1.0) return 'Low';
    if (m <= 1.1) return 'High';
    return 'Peak';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Seasonal Pricing</h1>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
            <Plus size={16} />
            Add Season
          </Button>
          <Button onClick={fetchSeasons} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Multiplier Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-slate-600 dark:text-slate-400">Low Season (1.0x)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span className="text-slate-600 dark:text-slate-400">High Season (1.1x)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-slate-600 dark:text-slate-400">Peak Season (1.15x)</span>
        </div>
      </div>

      {/* Add Season Form */}
      {showForm && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">New Season</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="Season Name"
                placeholder="e.g. Peak Season"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Multiplier"
                type="number"
                step="0.01"
                min="1"
                max="2"
                value={formData.multiplier}
                onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })}
              />
              <Input
                label="Start Date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
              <Input
                label="End Date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleCreate}>Create</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seasons Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Season</th>
                  <th className="px-6 py-3 font-medium">Multiplier</th>
                  <th className="px-6 py-3 font-medium">Start Date</th>
                  <th className="px-6 py-3 font-medium">End Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4 h-12 bg-slate-50/50 dark:bg-slate-800/20" />
                    </tr>
                  ))
                ) : seasons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No seasons configured. Add a season to get started.
                    </td>
                  </tr>
                ) : (
                  seasons.map((season) => (
                    <tr key={season.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        {editingId === season.id ? (
                          <Input
                            className="w-40 h-8"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          />
                        ) : (
                          <span className="font-medium">{season.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === season.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            className="w-20 h-8"
                            value={editData.multiplier}
                            onChange={(e) => setEditData({ ...editData, multiplier: e.target.value })}
                          />
                        ) : (
                          <span className={`font-bold ${getMultiplierColor(season.multiplier)}`}>
                            {season.multiplier}x
                            <span className="ml-2 text-xs font-normal text-slate-500">
                              ({getMultiplierLabel(season.multiplier)})
                            </span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === season.id ? (
                          <Input
                            type="date"
                            className="w-36 h-8"
                            value={editData.start_date}
                            onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                          />
                        ) : (
                          <span>{new Date(season.start_date).toLocaleDateString()}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === season.id ? (
                          <Input
                            type="date"
                            className="w-36 h-8"
                            value={editData.end_date}
                            onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                          />
                        ) : (
                          <span>{new Date(season.end_date).toLocaleDateString()}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(season.id, season.is_active)}
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            season.is_active
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {season.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {editingId === season.id ? (
                            <>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600" onClick={() => handleUpdate(season.id)}>
                                <Check size={16} />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => setEditingId(null)}>
                                <X size={16} />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingId(season.id);
                                  setEditData({
                                    name: season.name,
                                    multiplier: season.multiplier.toString(),
                                    start_date: season.start_date,
                                    end_date: season.end_date,
                                  });
                                }}
                              >
                                <Edit2 size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDelete(season.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Price Impact Example */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3">Price Impact Example</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
              <p className="font-medium text-green-700 dark:text-green-400">Low Season (1.0x)</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Airport → Paje: <span className="font-bold">$35</span></p>
              <p className="text-slate-500 dark:text-slate-500 text-xs">No adjustment</p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
              <p className="font-medium text-amber-700 dark:text-amber-400">High Season (1.1x)</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Airport → Paje: <span className="font-bold">$39</span> <span className="text-xs text-slate-500">(+ $4)</span></p>
              <p className="text-slate-500 dark:text-slate-500 text-xs">+10% surge</p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
              <p className="font-medium text-red-700 dark:text-red-400">Peak Season (1.15x)</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Airport → Paje: <span className="font-bold">$40</span> <span className="text-xs text-slate-500">(+ $5)</span></p>
              <p className="text-slate-500 dark:text-slate-500 text-xs">+15% surge</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
