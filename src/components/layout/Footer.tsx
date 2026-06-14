import Link from 'next/link';
import { MapPin, Mail, Phone, MessageCircle, Globe } from 'lucide-react';
import { SITE_NAME, TAGLINE, WHATSAPP_NUMBER } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
                ZG
              </div>
              <span className="text-xl font-bold text-white">{SITE_NAME}</span>
            </div>
            <p className="text-sm text-slate-400">{TAGLINE}</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              The easiest way to book reliable transfers across Zanzibar. Connect with verified drivers instantly.
            </p>
            <div className="flex gap-3">
              <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-primary hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/request" className="text-sm hover:text-primary transition-colors">Book Transfer</Link></li>
              <li><Link href="/register/driver" className="text-sm hover:text-primary transition-colors">Become a Driver</Link></li>
              <li><Link href="/login" className="text-sm hover:text-primary transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Popular Routes</h3>
            <ul className="space-y-3">
              <li><span className="text-sm">Airport → Paje</span></li>
              <li><span className="text-sm">Airport → Nungwi</span></li>
              <li><span className="text-sm">Stone Town → Paje</span></li>
              <li><span className="text-sm">Paje → Nungwi</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-primary shrink-0" />
                <span className="text-sm">Zanzibar, Tanzania</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary shrink-0" />
                <span className="text-sm">hello@zanzigo.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary shrink-0" />
                <span className="text-sm">{WHATSAPP_NUMBER}</span>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={16} className="text-primary shrink-0" />
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary-light transition-colors"
                >
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
