'use client';

import Link from 'next/link';
import { Plane, Building2, Car, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const services = [
  {
    icon: Plane,
    title: 'Airport Transfers',
    description: 'Stress-free pickup and drop-off at Abeid Amani Karume Airport. We track your flight.',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    icon: Building2,
    title: 'Hotel Transfers',
    description: 'Seamless transfers to and from any hotel, resort, or accommodation in Zanzibar.',
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  },
  {
    icon: Car,
    title: 'Private Taxi',
    description: 'On-demand private taxis for exploring Zanzibar at your own pace.',
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
];

export function ServicesSection() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Premium Transfer Services
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Whatever your transportation needs in Zanzibar, we have you covered with reliable, comfortable vehicles.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} hover className="text-center group">
              <div className={`inline-flex rounded-xl p-4 ${service.color} mb-5`}>
                <service.icon size={28} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{service.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{service.description}</p>
              <Link href="/request">
                <Button variant="ghost" size="sm" className="gap-1 group-hover:gap-2 transition-all">
                  Book Now <ArrowRight size={14} />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
