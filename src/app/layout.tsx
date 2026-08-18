import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/context/Providers';
import { DemoSwitcher } from '@/components/layout/DemoSwitcher';

export const metadata: Metadata = {
  title: 'CoachOS — Premier Coaching Business Operating System',
  description:
    'Multi-tenant coaching business operating system for workouts, diets, classes, client management, AI coaching tools, and private communities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 font-sans">
        <AppProviders>
          {children}
          <DemoSwitcher />
        </AppProviders>
      </body>
    </html>
  );
}
