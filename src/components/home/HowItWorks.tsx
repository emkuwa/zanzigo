'use client';

import { ClipboardList, UserCheck, Bell, Smile } from 'lucide-react';
import { HOW_IT_WORKS } from '@/lib/constants';

const icons = [ClipboardList, UserCheck, Bell, Smile];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Getting a ride across Zanzibar is as easy as 1-2-3-4
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {HOW_IT_WORKS.map((item, index) => {
            const Icon = icons[index];
            return (
              <div key={item.step} className="text-center group">
                <div className="relative inline-flex mb-6">
                  <div className="rounded-2xl bg-primary/10 p-5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Icon size={32} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
