import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/context/Providers';
import { DemoSwitcher } from '@/components/layout/DemoSwitcher';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

export const metadata: Metadata = {
  applicationName: 'Member',
  title: 'CoachOS — Premier Coaching Business Operating System',
  description:
    'Multi-tenant coaching business operating system for workouts, diets, classes, client management, AI coaching tools, and private communities.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/app-icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Member',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f766e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <AppProviders>
          <ServiceWorkerRegister />
          {children}
          <DemoSwitcher />
        </AppProviders>
      </body>
    </html>
  );
}
