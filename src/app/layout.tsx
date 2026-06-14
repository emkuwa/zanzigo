import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'ZanziGo - Your Ride Across Zanzibar',
    template: '%s | ZanziGo',
  },
  description: 'Book reliable Zanzibar transfers in minutes. Connect instantly with trusted drivers across Zanzibar. Airport transfers, hotel transfers, and private taxis.',
  keywords: ['Zanzibar', 'transfers', 'taxi', 'airport transfer', 'Zanzibar taxi', 'Zanzibar transport', 'tourist transfer'],
  openGraph: {
    title: 'ZanziGo - Your Ride Across Zanzibar',
    description: 'Book reliable Zanzibar transfers in minutes. Connect instantly with trusted drivers across Zanzibar.',
    url: 'https://zanzigo.com',
    siteName: 'ZanziGo',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZanziGo - Your Ride Across Zanzibar',
    description: 'Book reliable Zanzibar transfers in minutes. Connect instantly with trusted drivers across Zanzibar.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ZanziGo',
              url: 'https://zanzigo.com',
              logo: 'https://zanzigo.com/logo.png',
              description: 'Book reliable Zanzibar transfers in minutes. Connect instantly with trusted drivers across Zanzibar.',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'TZ',
                addressRegion: 'Zanzibar',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+255777000000',
                contactType: 'customer service',
              },
              sameAs: [
                'https://facebook.com/zanzigo',
                'https://instagram.com/zanzigo',
                'https://twitter.com/zanzigo',
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            position="top-center"
            richColors
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
