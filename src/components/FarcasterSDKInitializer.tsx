'use client';

import { useEffect } from 'react';

export function FarcasterSDKInitializer() {
  useEffect(() => {
    // Check if we're in a Farcaster Frame context
    const isInFarcasterFrame = typeof window !== 'undefined' && (
      window.location.href.includes('farcaster') ||
      window.location.href.includes('warpcast') ||
      window.location.href.includes('miniapps') ||
      (window as any).farcaster ||
      (window as any).warpcast ||
      (window as any).miniapp
    );

    if (isInFarcasterFrame) {
      // Dynamically import and initialize Farcaster SDK
      import('@farcaster/miniapp-sdk').then(({ sdk }) => {
        try {
          // Call ready() to dismiss the splash screen
          sdk.actions.ready();
          console.log('✅ Farcaster SDK ready() called');
        } catch (error) {
          console.error('Error calling Farcaster SDK ready():', error);
        }
      }).catch((error) => {
        console.warn('Farcaster Mini App SDK not available:', error);
      });
    }
  }, []);

  return null;
}

