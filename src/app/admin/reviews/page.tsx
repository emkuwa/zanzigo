'use client';

import { useEffect, useState } from 'react';
import { Star, Loader2, User, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { createClient } from '@/lib/supabase/client';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('reviews')
        .select('*, drivers!inner(full_name, vehicle_type)')
        .order('created_at', { ascending: false });
      if (data) setReviews(data);
      setLoading(false);
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pl-64 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <AdminSidebar />
      <div className="pl-64">
        <div className="p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Reviews</h1>

          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Star size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No reviews yet. Reviews will appear here once trips are completed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center shrink-0">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900 dark:text-white">{review.drivers?.full_name || 'Unknown Driver'}</p>
                            <span className="text-xs text-slate-400">{review.drivers?.vehicle_type}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}
                              />
                            ))}
                          </div>
                          {review.comment && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-2">
                            {new Date(review.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
