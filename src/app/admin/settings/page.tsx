'use client';

import { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    site_name: 'ZanziGo',
    tagline: 'Your Ride Across Zanzibar',
    whatsapp_number: '+255777000000',
    email: 'hello@zanzigo.com',
    phone: '+255777000000',
    commission_rate: '10',
    currency: 'TZS',
    exchange_rate: '2800',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setFormData({
          site_name: data.site_name || 'ZanziGo',
          tagline: data.tagline || 'Your Ride Across Zanzibar',
          whatsapp_number: data.whatsapp_number || '+255777000000',
          email: data.email || 'hello@zanzigo.com',
          phone: data.phone || '+255777000000',
          commission_rate: data.commission_rate?.toString() || '10',
          currency: data.currency || 'TZS',
          exchange_rate: data.exchange_rate?.toString() || '2800',
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('settings')
      .update({
        site_name: formData.site_name,
        tagline: formData.tagline,
        whatsapp_number: formData.whatsapp_number,
        email: formData.email,
        phone: formData.phone,
        commission_rate: parseFloat(formData.commission_rate),
        currency: formData.currency,
        exchange_rate: parseFloat(formData.exchange_rate),
      })
      .eq('id', (await supabase.from('settings').select('id').limit(1).single()).data?.id || '');

    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('Settings saved successfully');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <AdminSidebar />
      <div className="pl-64">
        <div className="p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h1>

          <div className="max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Site Name" value={formData.site_name} onChange={(e) => setFormData({ ...formData, site_name: e.target.value })} />
                <Input label="Tagline" value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} />
                <Input label="WhatsApp Number" value={formData.whatsapp_number} onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })} />
                <Input label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission & Currency Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Commission Rate (%)" value={formData.commission_rate} onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })} />
                <Input label="Currency" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
                <Input
                  label="Exchange Rate (1 USD = ? TZS)"
                  type="number"
                  value={formData.exchange_rate}
                  onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                />
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 text-sm text-slate-600 dark:text-slate-400">
                  <p className="font-medium text-slate-900 dark:text-white mb-1">Exchange Rate Preview</p>
                  <p>1 USD = {parseFloat(formData.exchange_rate || '2800').toLocaleString()} TZS</p>
                  <p>$15 = TZS {(15 * parseFloat(formData.exchange_rate || '2800')).toLocaleString()}</p>
                  <p>$50 = TZS {(50 * parseFloat(formData.exchange_rate || '2800')).toLocaleString()}</p>
                  <p>$70 = TZS {(70 * parseFloat(formData.exchange_rate || '2800')).toLocaleString()}</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
