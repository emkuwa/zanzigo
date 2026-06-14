'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { VEHICLE_TYPES, ZANZIBAR_AREAS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

export default function DriverRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    vehicle_type: '',
    vehicle_registration: '',
    areas_covered: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areas_covered: prev.areas_covered.includes(area)
        ? prev.areas_covered.filter(a => a !== area)
        : [...prev.areas_covered, area],
    }));
  };

  const validate = () => {
    if (!formData.full_name) return 'Please enter your full name';
    if (!formData.email) return 'Please enter your email';
    if (!formData.phone) return 'Please enter your phone number';
    if (!formData.whatsapp) return 'Please enter your WhatsApp number';
    if (!formData.vehicle_type) return 'Please select vehicle type';
    if (!formData.vehicle_registration) return 'Please enter vehicle registration';
    if (formData.areas_covered.length === 0) return 'Please select at least one area';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: submitError } = await supabase.from('drivers').insert({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        vehicle_type: formData.vehicle_type,
        vehicle_registration: formData.vehicle_registration,
        areas_covered: formData.areas_covered,
        status: 'pending',
      });

      if (submitError) throw submitError;

      await supabase.from('notifications').insert({
        user_id: null,
        title: 'New Driver Registration',
        message: `${formData.full_name} has registered as a driver`,
        type: 'system',
      });

      setStep('success');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 pt-24 pb-16">
        <div className="mx-auto max-w-lg px-4">
          <Card className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <CheckCircle2 size={36} className="text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Registration Submitted!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Thank you for registering as a driver. Our team will review your application and get back to you within 24-48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="primary">Back to Home</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Become a Driver
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Join ZanziGo and start earning by driving tourists across Zanzibar
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  id="full_name"
                  name="full_name"
                  label="Full Name"
                  placeholder="Your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>

              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Phone Number"
                placeholder="+255 7XX XXX XXX"
                value={formData.phone}
                onChange={handleChange}
              />

              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                label="WhatsApp Number"
                placeholder="+255 7XX XXX XXX"
                value={formData.whatsapp}
                onChange={handleChange}
              />

              <div className="sm:col-span-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="driver@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Vehicle Information</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  id="vehicle_type"
                  name="vehicle_type"
                  label="Vehicle Type"
                  placeholder="Select vehicle type"
                  options={VEHICLE_TYPES}
                  value={formData.vehicle_type}
                  onChange={handleChange}
                />

                <Input
                  id="vehicle_registration"
                  name="vehicle_registration"
                  label="Vehicle Registration"
                  placeholder="e.g., T123 ABC"
                  value={formData.vehicle_registration}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Areas Covered</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Select the areas you operate in</p>
              <div className="flex flex-wrap gap-2">
                {ZANZIBAR_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                      formData.areas_covered.includes(area)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:border-primary'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Documents</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                You will be able to upload your driver license and vehicle photos after account approval.
              </p>
              <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 text-center">
                <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Document upload will be available after registration
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                By submitting this form, you agree to our terms of service and privacy policy. Your information will be verified by our team before activation.
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full gap-2" loading={loading}>
              {loading ? (
                <>Submitting Application...</>
              ) : (
                <>
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
