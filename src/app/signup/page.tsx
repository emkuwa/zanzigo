'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'tourist',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
            role: formData.role,
          },
        },
      });

      if (signUpError) throw signUpError;

      router.push('/login?verified=true');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 pt-24 pb-16 flex items-center">
      <div className="mx-auto max-w-md w-full px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <Card>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg">
                ZG
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Join ZanziGo today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Input
              id="full_name"
              name="full_name"
              label="Full Name"
              placeholder="Your full name"
              value={formData.full_name}
              onChange={handleChange}
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@email.com"
              value={formData.email}
              onChange={handleChange}
            />

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
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
            />

            <Select
              id="role"
              name="role"
              label="Account Type"
              options={[
                { value: 'tourist', label: 'Tourist' },
                { value: 'driver', label: 'Driver' },
              ]}
              value={formData.role}
              onChange={handleChange}
            />

            <Button type="submit" size="lg" className="w-full gap-2" loading={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
