'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, ClipboardList, Route, Star, Settings, Bell, DollarSign, LogOut, Menu, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/drivers', icon: Users, label: 'Drivers' },
  { href: '/admin/requests', icon: ClipboardList, label: 'Requests' },
  { href: '/admin/trips', icon: Route, label: 'Trips' },
  { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { href: '/admin/pricing', icon: DollarSign, label: 'Pricing' },
  { href: '/admin/seasons', icon: Calendar, label: 'Seasons' },
  { href: '/admin/reviews', icon: Star, label: 'Reviews' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];


export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-20 left-4 z-40 lg:hidden rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 shadow-sm"
      >
        <Menu size={20} />
      </button>

      <aside className={cn(
        'fixed top-16 left-0 bottom-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col',
        collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'
      )}>
        <div className={cn('p-4 border-b border-slate-200 dark:border-slate-800', collapsed && 'lg:p-3')}>
          <div className={cn('flex items-center gap-3', collapsed && 'lg:justify-center')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs shrink-0">
              ZG
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Admin Panel</p>
                <p className="text-xs text-slate-500">ZanziGo</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  collapsed && 'lg:justify-center lg:px-2',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleSignOut}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors',
              collapsed && 'lg:justify-center lg:px-2'
            )}
          >
            <LogOut size={20} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
