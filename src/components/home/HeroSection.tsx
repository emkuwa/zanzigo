'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white/80 mb-8 animate-fade-in">
            <Shield size={14} className="text-primary" />
            Verified Drivers &bull; Instant Booking
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1] animate-fade-in">
            Book Reliable Zanzibar
            <span className="block text-primary mt-2">Transfers in Minutes</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed animate-fade-in">
            Connect instantly with trusted drivers across Zanzibar. Airport transfers, hotel pickups, and private taxis &mdash; all at your fingertips.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <Link href="/request">
              <Button size="lg" className="w-full sm:w-auto text-base gap-2">
                Book Transfer
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/register/driver">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base border-white/20 text-white hover:bg-white/10 hover:text-white">
                Become a Driver
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-8 mt-12 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-slate-800 flex items-center justify-center text-xs text-white font-medium">
                    {['SJ', 'MW', 'ET', 'JD'][i - 1]}
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-400">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                </div>
                <span>Trusted by travelers</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock size={16} />
              <span>Available 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
