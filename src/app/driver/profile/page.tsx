'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Car, MapPin, CheckCircle, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DriverSidebar } from '@/components/driver/DriverSidebar';
import { createClient } from '@/lib/supabase/client';

export default function DriverProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [driver, setDriver] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('drivers').select('*').eq('email', user.user.email).single();
      if (data) setDriver(data);
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    if (!driver) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('drivers').update({
      phone: driver.phone,
      whatsapp: driver.whatsapp,
    }).eq('id', driver.id);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pl-64 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!driver) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <DriverSidebar />
      <div className="pl-64">
        <div className="p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Profile</h1>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  {driver.full_name?.charAt(0)}
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{driver.full_name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{driver.email}</p>
                <Badge variant={driver.status === 'approved' ? 'success' : 'warning'}>
                  {driver.status === 'approved' ? 'Verified' : 'Pending Approval'}
                </Badge>
                {driver.status === 'approved' && (
                  <div className="mt-3 flex items-center justify-center gap-1 text-green-600 dark:text-green-400 text-xs">
                    <CheckCircle size={14} />
                    <span>Verified Driver</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input label="Full Name" value={driver.full_name} disabled />
                  <Input label="Email" value={driver.email} disabled />
                  <Input
                    label="Phone Number"
                    value={driver.phone}
                    onChange={(e) => setDriver({ ...driver, phone: e.target.value })}
                  />
                  <Input
                    label="WhatsApp Number"
                    value={driver.whatsapp}
                    onChange={(e) => setDriver({ ...driver, whatsapp: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Vehicle Type" value={driver.vehicle_type} disabled />
                    <Input label="Vehicle Registration" value={driver.vehicle_registration} disabled />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Areas Covered</p>
                    <div className="flex flex-wrap gap-2">
                      {driver.areas_covered?.map((area: string) => (
                        <Badge key={area} variant="info">{area}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleSave} loading={saving} className="gap-2">
                    <Save size={16} />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
