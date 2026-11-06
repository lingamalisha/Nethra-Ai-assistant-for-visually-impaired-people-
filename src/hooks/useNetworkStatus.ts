import { useEffect, useState } from 'react';
import { soundEffects } from '../services/soundEffects';

export function useNetworkStatus(onNetworkChange?: (isOnline: boolean) => void) {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      soundEffects.playSuccess();
      if (onNetworkChange) onNetworkChange(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      soundEffects.playNetworkAlert();
      if (onNetworkChange) onNetworkChange(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onNetworkChange]);

  return isOnline;
}
