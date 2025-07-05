import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineAt: Date | null;
}

export function useOfflineDetection() {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    wasOffline: false,
    lastOnlineAt: navigator.onLine ? new Date() : null,
  });

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => {
        // Show reconnection toast if we were offline
        if (prev.wasOffline) {
          toast({
            title: 'Back Online',
            description: 'Connection restored. Syncing data...',
          });
        }
        
        return {
          isOnline: true,
          wasOffline: false,
          lastOnlineAt: new Date(),
        };
      });
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        isOnline: false,
        wasOffline: true,
      }));

      toast({
        title: 'Connection Lost',
        description: 'You are now offline. Some features may be limited.',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Ping server periodically to detect connection issues
    const pingInterval = setInterval(async () => {
      if (!navigator.onLine) return;

      try {
        const response = await fetch('/api/ping', {
          method: 'HEAD',
          cache: 'no-cache',
        });
        
        if (!response.ok && state.isOnline) {
          handleOffline();
        }
      } catch {
        if (state.isOnline) {
          handleOffline();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pingInterval);
    };
  }, [state.isOnline]);

  return {
    isOnline: state.isOnline,
    isOffline: !state.isOnline,
    wasOffline: state.wasOffline,
    lastOnlineAt: state.lastOnlineAt,
  };
}

// Hook for handling offline-capable operations
export function useOfflineCapableOperation() {
  const { isOnline, isOffline } = useOfflineDetection();

  const executeOperation = async <T>(
    operation: () => Promise<T>,
    fallback?: () => T | Promise<T>
  ): Promise<T> => {
    if (isOffline && !fallback) {
      throw new Error('Operation not available offline');
    }

    try {
      if (isOnline) {
        return await operation();
      } else if (fallback) {
        const result = await fallback();
        
        toast({
          title: 'Offline Mode',
          description: 'Using cached data. Changes will sync when online.',
        });
        
        return result;
      }
    } catch (error) {
      if (isOffline && fallback) {
        const result = await fallback();
        
        toast({
          title: 'Using Cached Data',
          description: 'Network unavailable. Showing last known data.',
        });
        
        return result;
      }
      throw error;
    }

    throw new Error('Operation failed');
  };

  return {
    executeOperation,
    isOnline,
    isOffline,
  };
}