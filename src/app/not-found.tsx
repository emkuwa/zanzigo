
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPinOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <MapPinOff size={40} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">404 - Route Not Found</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          It looks like the destination you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}
