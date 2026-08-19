import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    id: '/dashboard',
    name: 'CoachOS — Studio & Dashboard',
    short_name: 'Coach Studio',
    description: 'Coach management suite, client CRM, automated billing, workout studios, and AI protocol builder.',
    start_url: '/dashboard?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui', 'browser'],
    orientation: 'any',
    background_color: '#f8fafc',
    theme_color: '#0f766e',
    categories: ['business', 'fitness', 'productivity'],
    icons: [
      {
        src: '/icons/dashboard-icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
