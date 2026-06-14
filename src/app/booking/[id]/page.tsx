'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Clock, Users, MessageCircle, Loader2, AlertCircle, CheckCircle2, User, Car, Phone, Star, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { TransferRequest, TripAssignment } from '@/lib/types';
import { getStatusLabel, getStatusColor, whatsappLink } from '@/lib/utils';

export default function BookingStatusPage() {
  const params = useParams();
  const [request, setRequest] = useState<TransferRequest | null>(null);
  const [assignment, setAssignment] = useState<TripAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: reqData } = await supabase
      .from('transfer_requests')
      .select('*')
      .eq('id', params.id)
      .single();

    if (reqData) {
      setRequest(reqData);
      const { data: assignData } = await supabase
        .from('trip_assignments')
        .select('*')
        .eq('request_id', params.id)
        .single();
      if (assignData) setAssignment(assignData);

      if (assignData?.status === 'completed') {
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('trip_id', assignData.id)
          .single();
        if (existingReview) setReviewSubmitted(true);
      }
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchData();
    if (!request || (request.status !== 'completed' && request.status !== 'cancelled')) {
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchData, request?.status]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: cancelError } = await supabase
        .from('transfer_requests')
        .update({ status: 'cancelled' })
        .eq('id', params.id);

      if (cancelError) throw cancelError;
      fetchData();
    } catch {
      setError('Failed to cancel booking.');
    }
    setCancelling(false);
  };

  const handleSubmitReview = async () => {
    if (!assignment) return;
    setSubmittingReview(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          trip_id: assignment.id,
          driver_id: assignment.driver_id,
          rating: reviewRating,
          comment: reviewComment || null,
        });

      if (reviewError) throw reviewError;

      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('driver_id', assignment.driver_id);

      const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : reviewRating;

      await supabase
        .from('drivers')
        .update({
          rating: Math.round(avgRating * 10) / 10,
          total_trips: reviews?.length || 1,
        })
        .eq('id', assignment.driver_id);

      setReviewSubmitted(true);
    } catch {
      setError('Failed to submit review.');
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Booking Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">The booking you are looking for does not exist.</p>
          <Link href="/"><Button>Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  const status = request.status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Booking Status</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Reference: <span className="font-mono font-bold text-primary">{request.id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Status Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {['pending', 'assigned', 'in_progress', 'completed'].map((s, i) => {
                const steps = ['pending', 'assigned', 'in_progress', 'completed'];
                const statusIndex = steps.indexOf(status);
                const isActive = status !== 'cancelled' && i <= statusIndex;
                const isCurrent = status !== 'cancelled' && i === statusIndex;
                return (
                  <div key={s} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : status === 'cancelled'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}>
                      {status === 'cancelled' && s === 'pending' ? <XCircle size={18} /> : isActive ? <CheckCircle2 size={18} /> : i + 1}
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? 'text-primary font-medium' : status === 'cancelled' ? 'text-red-500' : 'text-slate-400'}`}>
                      {getStatusLabel(s)}
                    </span>
                  </div>
                );
              })}
            </div>
            <Badge className={`mt-4 ${getStatusColor(status)}`}>{getStatusLabel(status)}</Badge>
          </CardContent>
        </Card>

        {/* Trip Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Pickup</p>
                  <p className="font-medium">{request.pickup_location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Destination</p>
                  <p className="font-medium">{request.destination}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="text-sm font-medium">{request.pickup_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Time</p>
                    <p className="text-sm font-medium">{request.pickup_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Passengers</p>
                    <p className="text-sm font-medium">{request.passengers}</p>
                  </div>
                </div>
              </div>
              {request.special_notes && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Special Notes</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{request.special_notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        {assignment && (
          <Card className="mb-6 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle2 size={20} />
                Driver Assigned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  {assignment.driver_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{assignment.driver_name}</h3>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="text-green-600 dark:text-green-400 text-xs">Verified Driver</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Car size={16} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">{assignment.vehicle_type} &mdash; {assignment.vehicle_registration}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">{assignment.driver_phone}</span>
                </div>
              </div>

              <a
                href={whatsappLink(assignment.driver_whatsapp, `Hi, I am your ZanziGo driver for trip to ${request.destination}.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" className="w-full gap-2">
                  <MessageCircle size={18} />
                  Contact Driver on WhatsApp
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        {/* Finding driver */}
        {!assignment && status === 'pending' && (
          <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900">
            <CardContent className="pt-6 text-center">
              <Clock size={36} className="mx-auto text-yellow-500 mb-3 animate-pulse-soft" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Finding a Driver</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                We are notifying available drivers in your area. You will receive a notification once a driver accepts.
              </p>
              <div className="flex items-center justify-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancel button (only when pending) */}
        {status === 'pending' && (
          <div className="mb-6 text-center">
            <Button
              variant="danger"
              className="gap-2"
              onClick={handleCancel}
              loading={cancelling}
            >
              <XCircle size={16} />
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </div>
        )}

        {/* Cancelled message */}
        {status === 'cancelled' && (
          <Card className="mb-6 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900">
            <CardContent className="pt-6 text-center">
              <XCircle size={36} className="mx-auto text-red-500 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Booking Cancelled</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">This booking has been cancelled.</p>
            </CardContent>
          </Card>
        )}

        {/* Review Form */}
        {status === 'completed' && !reviewSubmitted && (
          <Card className="mb-6 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star size={20} className="text-yellow-500" />
                Rate Your Trip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">How was your trip?</p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`p-1 transition-all ${star <= reviewRating ? 'text-yellow-400 scale-110' : 'text-slate-300 dark:text-slate-600'}`}
                    >
                      <Star size={32} fill={star <= reviewRating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Share your experience (optional)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
              <Button
                className="w-full mt-4 gap-2"
                onClick={handleSubmitReview}
                loading={submittingReview}
              >
                <Star size={16} />
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Review submitted message */}
        {status === 'completed' && reviewSubmitted && (
          <Card className="mb-6 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 size={36} className="mx-auto text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Thank You!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Your review has been submitted.</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
