'use client';

import { MapPin, Clock, Route } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { POPULAR_ROUTES } from '@/lib/constants';
import Link from 'next/link';

export function PopularDestinations() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Popular Routes
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Most booked transfers across Zanzibar. Transparent pricing, no surprises.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_ROUTES.map((route) => (
            <Card key={`${route.from}-${route.to}`} hover className="group">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3 text-primary shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">From</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">${route.price_usd}</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">≈ TZS {route.price}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{route.from}</p>
                  <div className="my-2 border-t border-dashed border-slate-200 dark:border-slate-700" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">To</span>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={12} />{route.duration}</span>
                      <span className="flex items-center gap-1"><Route size={12} />{route.distance}</span>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white truncate mt-1">{route.to}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/request">
            <Button size="lg" className="gap-2">
              Book Your Transfer
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
