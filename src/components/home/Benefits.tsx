'use client';

import { ShieldCheck, Zap, MessageCircle, Wallet, Headphones, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

const iconMap: Record<string, React.ElementType> = {
  ShieldCheck,
  Zap,
  MessageCircle,
  Wallet,
  Headphones,
  MapPin,
};

const benefits = [
  {
    title: 'Verified Drivers',
    description: 'All drivers are thoroughly vetted and verified for your safety and peace of mind.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Instant Booking',
    description: 'Book your transfer in under 2 minutes. No phone calls needed.',
    icon: 'Zap',
  },
  {
    title: 'WhatsApp Integration',
    description: 'Receive updates and communicate with your driver via WhatsApp.',
    icon: 'MessageCircle',
  },
  {
    title: 'Best Prices',
    description: 'Transparent pricing with no hidden fees. Pay the price you see.',
    icon: 'Wallet',
  },
  {
    title: '24/7 Support',
    description: 'Our support team is available around the clock to help with any issues.',
    icon: 'Headphones',
  },
  {
    title: 'GPS Tracking',
    description: 'Your driver\'s location is tracked so you know exactly when they\'ll arrive.',
    icon: 'MapPin',
  },
];

export function Benefits() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Why Choose ZanziGo
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            We make your Zanzibar travel experience seamless and stress-free
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = iconMap[benefit.icon];
            return (
              <Card key={benefit.title} hover>
                <div className="rounded-lg bg-primary/10 p-3 w-fit text-primary mb-4">
                  {Icon && <Icon size={24} />}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{benefit.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
