import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    id: '/app/',
    name: 'Coach Business Platform — Client App',
    short_name: 'Coach Client',
    description: 'Personalized training routines, macro targets, AI food vision, and direct coach communication.',
    start_url: '/app/',
    scope: '/app/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8fafc',
    theme_color: '#0f766e',
    categories: ['fitness', 'health', 'lifestyle'],
    icons: [
      {
        src: '/icons/app-icon.svg',
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
