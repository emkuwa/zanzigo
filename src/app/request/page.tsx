'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, MapPin, Calendar, Clock, Users, Smartphone, Mail, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ZANZIBAR_AREAS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';

export default function RequestPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    pickup_location: '',
    destination: '',
    pickup_date: '',
    pickup_time: '',
    passengers: '1',
    tourist_whatsapp: '',
    tourist_email: '',
    tourist_name: '',
    special_notes: '',
  });
  const [bookingId, setBookingId] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [priceTzs, setPriceTzs] = useState<number | null>(null);
  const [seasonData, setSeasonData] = useState<{
    season_name: string;
    season_multiplier: number;
    base_price_usd: number;
    base_price_tzs: number;
    adjustment_usd: number;
    adjustment_tzs: number;
  } | null>(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fetch price when route or date changes
    if (name === 'pickup_location' || name === 'destination' || name === 'pickup_date') {
      const newPickup = name === 'pickup_location' ? value : formData.pickup_location;
      const newDest = name === 'destination' ? value : formData.destination;
      const newDate = name === 'pickup_date' ? value : formData.pickup_date;

      if (newPickup && newDest) {
        fetchPrice(newPickup, newDest, newDate);
      }
    }
  };

  const fetchPrice = async (pickup: string, destination: string, date?: string) => {
    setFetchingPrice(true);
    try {
      const params = new URLSearchParams({
        pickup,
        destination,
      });
      if (date) params.set('pickup_date', date);

      const res = await fetch(`/api/pricing?${params.toString()}`);
      const data = await res.json();
      setPrice(data.price);
      setPriceTzs(data.price_tzs);

      if (data.season_multiplier > 1) {
        setSeasonData({
          season_name: data.season_name,
          season_multiplier: data.season_multiplier,
          base_price_usd: data.base_price_usd,
          base_price_tzs: data.base_price_tzs,
          adjustment_usd: data.adjustment_usd,
          adjustment_tzs: data.adjustment_tzs,
        });
      } else {
        setSeasonData(null);
      }
    } catch (err) {
      console.error('Price fetch error:', err);
    } finally {
      setFetchingPrice(false);
    }
  };

  const validate = () => {
    if (!formData.pickup_location) return 'Please enter pickup location';
    if (!formData.destination) return 'Please enter destination';
    if (!formData.pickup_date) return 'Please select pickup date';
    if (!formData.pickup_time) return 'Please select pickup time';
    if (!formData.tourist_name) return 'Please enter your name';
    if (!formData.tourist_whatsapp) return 'Please enter your WhatsApp number';
    if (!formData.tourist_email) return 'Please enter your email';
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
      trackEvent('form_submit', {
        route: `${formData.pickup_location} -> ${formData.destination}`,
        season: seasonData?.season_name || 'Low Season',
        season_multiplier: seasonData?.season_multiplier || 1.0,
      });
      const response = await fetch('/api/transfer-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup_location: formData.pickup_location,
          destination: formData.destination,
          pickup_date: formData.pickup_date,
          pickup_time: formData.pickup_time,
          passengers: parseInt(formData.passengers),
          tourist_name: formData.tourist_name,
          tourist_whatsapp: formData.tourist_whatsapp,
          tourist_email: formData.tourist_email,
          special_notes: formData.special_notes || null,
          price_quoted: price,
          base_price_usd: seasonData?.base_price_usd || price,
          season_multiplier: seasonData?.season_multiplier || 1.0,
          status: 'pending',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setBookingId(data.id);
      setStep('success');
      trackEvent('booking_complete', { booking_id: data.id, season: seasonData?.season_name || 'Low Season' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
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
              Request Submitted Successfully!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Your transfer request has been sent to available drivers. You will be notified once a driver accepts.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-8 text-left space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Booking Reference</p>
              <p className="text-lg font-mono font-bold text-primary">{bookingId.slice(0, 8).toUpperCase()}</p>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 space-y-1">
                <p className="text-sm"><span className="text-slate-500">From:</span> <span className="font-medium">{formData.pickup_location}</span></p>
                <p className="text-sm"><span className="text-slate-500">To:</span> <span className="font-medium">{formData.destination}</span></p>
                <p className="text-sm"><span className="text-slate-500">Date:</span> <span className="font-medium">{formData.pickup_date} at {formData.pickup_time}</span></p>
                <p className="text-sm"><span className="text-slate-500">Passengers:</span> <span className="font-medium">{formData.passengers}</span></p>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                {seasonData && seasonData.season_multiplier > 1 ? (
                  <div className="space-y-1">
                    <p className="text-sm"><span className="text-slate-500">Base Price:</span> <span className="font-medium">${seasonData.base_price_usd}</span></p>
                    <p className="text-sm"><span className="text-slate-500">Season:</span> <span className="font-medium text-amber-600">{seasonData.season_name} ({seasonData.season_multiplier}x)</span></p>
                    <p className="text-sm"><span className="text-slate-500">Adjustment:</span> <span className="font-medium text-amber-600">+${seasonData.adjustment_usd}</span></p>
                    <p className="text-sm font-bold"><span className="text-slate-500">Final Price:</span> <span className="text-primary">${price}</span> <span className="text-xs font-normal text-slate-500">≈ TZS {priceTzs?.toLocaleString()}</span></p>
                  </div>
                ) : (
                  <p className="text-sm font-bold"><span className="text-slate-500">Price:</span> <span className="text-primary">${price}</span> <span className="text-xs font-normal text-slate-500">≈ TZS {priceTzs?.toLocaleString()}</span></p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/booking/${bookingId}`}>
                <Button variant="primary">Track Booking</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
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
            Book Your Transfer
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Fill in the details below and we will find you a driver
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
                <Select
                  id="pickup_location"
                  name="pickup_location"
                  label="Pickup Location"
                  placeholder="Select pickup location"
                  options={ZANZIBAR_AREAS.map(a => ({ value: a, label: a }))}
                  value={formData.pickup_location}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <Select
                  id="destination"
                  name="destination"
                  label="Destination"
                  placeholder="Select destination"
                  options={ZANZIBAR_AREAS.map(a => ({ value: a, label: a }))}
                  value={formData.destination}
                  onChange={handleChange}
                />
              </div>

              <Input
                id="pickup_date"
                name="pickup_date"
                type="date"
                label="Pickup Date"
                value={formData.pickup_date}
                onChange={handleChange}
              />

              <Input
                id="pickup_time"
                name="pickup_time"
                type="time"
                label="Pickup Time"
                value={formData.pickup_time}
                onChange={handleChange}
              />

              <Select
                id="passengers"
                name="passengers"
                label="Number of Passengers"
                options={[
                  { value: '1', label: '1 Passenger' },
                  { value: '2', label: '2 Passengers' },
                  { value: '3', label: '3 Passengers' },
                  { value: '4', label: '4 Passengers' },
                  { value: '5', label: '5 Passengers' },
                  { value: '6', label: '6 Passengers' },
                  { value: '7', label: '7 Passengers' },
                  { value: '8', label: '8+ Passengers' },
                ]}
                value={formData.passengers}
                onChange={handleChange}
              />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  id="tourist_name"
                  name="tourist_name"
                  label="Full Name"
                  placeholder="Your full name"
                  value={formData.tourist_name}
                  onChange={handleChange}
                />

                <Input
                  id="tourist_whatsapp"
                  name="tourist_whatsapp"
                  type="tel"
                  label="WhatsApp Number"
                  placeholder="+255 7XX XXX XXX"
                  value={formData.tourist_whatsapp}
                  onChange={handleChange}
                />

                <div className="sm:col-span-2">
                  <Input
                    id="tourist_email"
                    name="tourist_email"
                    type="email"
                    label="Email Address"
                    placeholder="your@email.com"
                    value={formData.tourist_email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <Textarea
              id="special_notes"
              name="special_notes"
              label="Special Notes (Optional)"
              placeholder="Any special requirements? Luggage, child seats, etc."
              value={formData.special_notes}
              onChange={handleChange}
            />

            {price !== null && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Estimated Price</p>
                  {seasonData && seasonData.season_multiplier > 1 && (
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                      {seasonData.season_name} ({seasonData.season_multiplier}x)
                    </span>
                  )}
                </div>

                {seasonData && seasonData.season_multiplier > 1 ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Base Price</span>
                      <span className="text-slate-600 dark:text-slate-300">${seasonData.base_price_usd}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Season Adjustment</span>
                      <span className="text-amber-600 dark:text-amber-400">+${seasonData.adjustment_usd}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-1 flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">Final Price</span>
                      <span className="text-2xl font-bold text-primary">${price}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-primary">${price}</p>
                )}

                {priceTzs && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">≈ TZS {priceTzs.toLocaleString()}</p>
                )}

                <p className="text-xs text-slate-500 italic mt-2">Pay to driver upon arrival</p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full gap-2" loading={loading} disabled={fetchingPrice}>
              {loading ? (
                <>Finding Available Drivers...</>
              ) : (
                <>
                  <Send size={18} />
                  Find Driver
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
