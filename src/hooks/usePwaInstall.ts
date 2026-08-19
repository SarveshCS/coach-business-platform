'use client';

import { useState, useEffect, useCallback } from 'react';

// BeforeInstallPromptEvent interface definition for TypeScript
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type PwaPlatform = 'ios' | 'android' | 'chromium' | 'safari' | 'firefox' | 'desktop';
export type InstallStatus = 'idle' | 'installable' | 'prompting' | 'accepted' | 'dismissed' | 'installed' | 'unsupported';

const SIMULATED_STANDALONE_KEY = 'coach_pwa_simulated_standalone';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installStatus, setInstallStatus] = useState<InstallStatus>('idle');
  const [platform, setPlatform] = useState<PwaPlatform>('chromium');
  const [isSimulatedStandalone, setIsSimulatedStandalone] = useState(false);

  // Detect platform & standalone mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect simulated standalone mode in session/localStorage
    const sim = localStorage.getItem(SIMULATED_STANDALONE_KEY) === 'true';
    setIsSimulatedStandalone(sim);

    // Detect native standalone display mode
    const isNativeStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari navigator.standalone non-standard property
      window.navigator?.standalone === true ||
      document.referrer.includes('android-app://');

    const effectiveStandalone = isNativeStandalone || sim;
    setIsStandalone(effectiveStandalone);

    if (effectiveStandalone) {
      setInstallStatus('installed');
    }

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /android/.test(userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isFirefox = /firefox/.test(userAgent);

    if (isIos) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else if (isSafari) {
      setPlatform('safari');
    } else if (isFirefox) {
      setPlatform('firefox');
    } else {
      setPlatform('desktop');
    }

    // Listen for beforeinstallprompt event on Chromium/Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
      if (!effectiveStandalone) {
        setInstallStatus('installable');
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      setInstallStatus('installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger the browser installation prompt
  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    if (!deferredPrompt) {
      return 'unsupported';
    }

    try {
      setInstallStatus('prompting');
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setInstallStatus('accepted');
        setIsInstallable(false);
        setDeferredPrompt(null);
        return 'accepted';
      } else {
        setInstallStatus('dismissed');
        return 'dismissed';
      }
    } catch {
      setInstallStatus('idle');
      return 'unsupported';
    }
  }, [deferredPrompt]);

  // Toggle simulated standalone mode for demo/testing purposes
  const toggleSimulatedStandalone = useCallback((value?: boolean) => {
    if (typeof window === 'undefined') return;
    const nextVal = typeof value === 'boolean' ? value : !isSimulatedStandalone;
    localStorage.setItem(SIMULATED_STANDALONE_KEY, String(nextVal));
    setIsSimulatedStandalone(nextVal);
    setIsStandalone(nextVal);
    if (nextVal) {
      setInstallStatus('installed');
    } else {
      setInstallStatus(deferredPrompt ? 'installable' : 'idle');
    }
  }, [isSimulatedStandalone, deferredPrompt]);

  return {
    isInstallable,
    isStandalone,
    installStatus,
    platform,
    promptInstall,
    isSimulatedStandalone,
    toggleSimulatedStandalone,
  };
}
