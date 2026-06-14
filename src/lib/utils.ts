import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_EXCHANGE_RATE = 2800;

export function usdToTzs(usd: number, exchangeRate: number = DEFAULT_EXCHANGE_RATE): number {
  return Math.round(usd * exchangeRate);
}

export function formatUSD(amount: number): string {
  return `$${amount}`;
}

export function formatTZS(amount: number): string {
  return `TZS ${amount.toLocaleString()}`;
}

export function formatDualCurrency(usd: number, exchangeRate: number = DEFAULT_EXCHANGE_RATE): { usd: string; tzs: string; tzsAmount: number } {
  const tzsAmount = usdToTzs(usd, exchangeRate);
  return {
    usd: formatUSD(usd),
    tzs: formatTZS(tzsAmount),
    tzsAmount,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    searching: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    assigned: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || colors.pending;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    searching: 'Searching',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    approved: 'Approved',
    suspended: 'Suspended',
    rejected: 'Rejected',
  };
  return labels[status] || status;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function whatsappLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleaned}`;
  if (message) {
    return `${url}?text=${encodeURIComponent(message)}`;
  }
  return url;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getSeasonMultiplier(
  pickupDate: string,
  seasons: { name: string; multiplier: number; start_date: string; end_date: string; is_active: boolean }[]
): { name: string; multiplier: number } {
  if (!pickupDate || !seasons.length) {
    return { name: 'Low Season', multiplier: 1.0 };
  }

  const date = new Date(pickupDate);
  const activeSeason = seasons
    .filter(s => s.is_active)
    .find(s => {
      const start = new Date(s.start_date);
      const end = new Date(s.end_date);
      return date >= start && date <= end;
    });

  if (activeSeason) {
    return { name: activeSeason.name, multiplier: activeSeason.multiplier };
  }

  return { name: 'Low Season', multiplier: 1.0 };
}

export function calculateSeasonalPrice(
  basePriceUsd: number,
  multiplier: number,
  exchangeRate: number = DEFAULT_EXCHANGE_RATE
): {
  base_price_usd: number;
  season_multiplier: number;
  final_price_usd: number;
  adjustment_usd: number;
  base_price_tzs: number;
  final_price_tzs: number;
  adjustment_tzs: number;
} {
  const finalPriceUsd = Math.round(basePriceUsd * multiplier * 100) / 100;
  const adjustmentUsd = Math.round((finalPriceUsd - basePriceUsd) * 100) / 100;
  const basePriceTzs = usdToTzs(basePriceUsd, exchangeRate);
  const finalPriceTzs = usdToTzs(finalPriceUsd, exchangeRate);
  const adjustmentTzs = finalPriceTzs - basePriceTzs;

  return {
    base_price_usd: basePriceUsd,
    season_multiplier: multiplier,
    final_price_usd: finalPriceUsd,
    adjustment_usd: adjustmentUsd,
    base_price_tzs: basePriceTzs,
    final_price_tzs: finalPriceTzs,
    adjustment_tzs: adjustmentTzs,
  };
}
