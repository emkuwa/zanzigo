
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AcceptTokenPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_accepted'>('loading');
  const [error, setError] = useState('');
  const [tripData, setTripData] = useState<any>(null);

  const handleAccept = useCallback(async () => {
    try {
      const response = await fetch(`/api/accept/${params.token}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setTripData(data.trip);
      } else if (response.status === 410 || response.status === 409) {
        setStatus('already_accepted');
      } else {
        setStatus('error');
        setError(data.error || 'Failed to accept trip');
      }
    } catch (err) {
      setStatus('error');
      setError('A network error occurred');
    }
  }, [params.token]);

  useEffect(() => {
    handleAccept();
  }, [handleAccept]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="pt-10 pb-10 text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <h1 className="text-xl font-bold">Processing Acceptance...</h1>
              <p className="text-slate-500">Please wait while we secure your booking.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trip Accepted!</h1>
                <p className="text-slate-500 mt-2">You have successfully been assigned to this trip.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-left border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 font-semibold text-sm mb-2">
                  <MapPin size={14} className="text-primary" />
                  <span>Trip Details</span>
                </div>
                <p className="text-xs text-slate-500">Reference: {tripData?.id?.slice(0,8).toUpperCase()}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">Please go to your dashboard to view tourist contact details and start the trip.</p>
                </div>
              </div>
              <Button className="w-full gap-2" onClick={() => router.push('/driver/dashboard')}>
                Go to Dashboard
                <ArrowRight size={16} />
              </Button>
            </div>
          )}

          {status === 'already_accepted' && (
            <div className="space-y-6">
              <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Already Taken</h1>
                <p className="text-slate-500 mt-2">Sorry, another driver has already accepted this trip or it was cancelled.</p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push('/driver/dashboard')}>
                Check Other Requests
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Acceptance Failed</h1>
                <p className="text-red-500 mt-2 font-medium">{error}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push('/driver/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
