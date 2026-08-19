'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePwaInstall } from './usePwaInstall';
import { useToast } from '@/context/ToastContext';

/**
 * useStandaloneGuard
 * 
 * Frontend navigation guard for the Client PWA standalone environment.
 * When running in installed/standalone Client PWA mode:
 * - Directs any out-of-scope management routes (/dashboard/*) back to /app/
 * - Normal browser mode remains completely unrestricted.
 */
export function useStandaloneGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { isStandalone } = usePwaInstall();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isStandalone || !pathname) return;

    // If running in Client PWA standalone mode and attempting to access coach / management routes:
    if (pathname.startsWith('/dashboard')) {
      showToast(
        'Client Application',
        'Management dashboard is accessible via desktop web browser.',
        'info'
      );
      router.replace('/app');
    }
  }, [isStandalone, pathname, router, showToast]);

  return { isStandalone };
}
