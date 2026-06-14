'use client';

import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WHATSAPP_NUMBER } from '@/lib/constants';

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-r from-primary to-primary-dark">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Explore Zanzibar?
        </h2>
        <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
          Book your transfer now and experience the easiest way to get around Zanzibar. Verified drivers, best prices, instant booking.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/request">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-primary hover:bg-slate-100 text-base gap-2 shadow-lg"
            >
              Book Your Transfer
              <ArrowRight size={18} />
            </Button>
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white text-base gap-2"
            >
              <MessageCircle size={18} />
              WhatsApp Us
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
