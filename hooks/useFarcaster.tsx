import { useState, useEffect, useCallback } from 'react';

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  custody: string;
  verifications: string[];
}

interface FarcasterContext {
  user?: FarcasterUser;
  location?: {
    placeId?: string;
    description?: string;
  };
  client?: {
    name: string;
    version: string;
  };
}

interface UseFarcasterReturn {
  isMiniApp: boolean;
  user: FarcasterUser | null;
  context: FarcasterContext | null;
  isReady: boolean;
  sendNotification: (message: string, targetUrl?: string) => Promise<void>;
  close: () => Promise<void>;
  openUrl: (url: string) => Promise<void>;
  ready: () => Promise<void>;
}

export const useFarcaster = (): UseFarcasterReturn => {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [sdk, setSdk] = useState<any>(null);

  useEffect(() => {
    const initializeFarcaster = async () => {
      // Check if we're in a Farcaster Mini App environment
      const isMiniAppEnv = !!(window as any).isFarcasterMiniApp;
      setIsMiniApp(isMiniAppEnv);

      if (isMiniAppEnv && (window as any).farcasterSdk) {
        try {
          const farcasterSdk = (window as any).farcasterSdk;
          setSdk(farcasterSdk);

          // Get context
          const ctx = await farcasterSdk.context;
          setContext(ctx);
          
          if (ctx?.user) {
            setUser(ctx.user);
          }

          console.log('🚀 Farcaster Mini App context loaded:', ctx);
        } catch (error) {
          console.error('❌ Failed to load Farcaster context:', error);
        }
      }
    };

    initializeFarcaster();
  }, []);

  const ready = useCallback(async () => {
    if (sdk && isMiniApp) {
      try {
        await sdk.actions.ready();
        setIsReady(true);
        console.log('✅ Farcaster Mini App marked as ready');
      } catch (error) {
        console.error('❌ Failed to mark app as ready:', error);
      }
    }
    
    // Call the global function to hide loading screen
    if ((window as any).showMiniApp) {
      (window as any).showMiniApp();
    }
  }, [sdk, isMiniApp]);

  const sendNotification = useCallback(async (message: string, targetUrl?: string) => {
    if (!sdk || !isMiniApp) {
      console.warn('Cannot send notification: not in Farcaster Mini App');
      return;
    }

    try {
      await sdk.actions.sendNotification({
        message,
        targetUrl
      });
      console.log('📫 Notification sent:', message);
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
    }
  }, [sdk, isMiniApp]);

  const close = useCallback(async () => {
    if (!sdk || !isMiniApp) {
      console.warn('Cannot close: not in Farcaster Mini App');
      return;
    }

    try {
      await sdk.actions.close();
    } catch (error) {
      console.error('❌ Failed to close app:', error);
    }
  }, [sdk, isMiniApp]);

  const openUrl = useCallback(async (url: string) => {
    if (!sdk || !isMiniApp) {
      // Fallback for non-Mini App environment
      window.open(url, '_blank');
      return;
    }

    try {
      await sdk.actions.openUrl(url);
    } catch (error) {
      console.error('❌ Failed to open URL:', error);
      // Fallback
      window.open(url, '_blank');
    }
  }, [sdk, isMiniApp]);

  return {
    isMiniApp,
    user,
    context,
    isReady,
    sendNotification,
    close,
    openUrl,
    ready
  };
};