import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    id: '/dashboard/',
    name: 'Coach Business Platform — Studio & Dashboard',
    short_name: 'Coach Studio',
    description: 'Coach management suite, client CRM, automated billing, workout studios, and AI protocol builder.',
    start_url: '/dashboard/',
    scope: '/dashboard/',
    display: 'standalone',
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
