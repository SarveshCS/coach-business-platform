import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/context/Providers';
import { DemoSwitcher } from '@/components/layout/DemoSwitcher';

export const metadata: Metadata = {
  title: 'CoachOS — Premier Coaching Business Operating System',
  description:
    'Multi-tenant coaching business operating system for workouts, diets, classes, client management, AI coaching tools, and private communities.',
  manifest: '/manifest-app.webmanifest',
  icons: {
    icon: '/icons/app-icon.svg',
    apple: '/icons/app-icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Coach Client',
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
          {children}
          <DemoSwitcher />
        </AppProviders>
      </body>
    </html>
  );
}
