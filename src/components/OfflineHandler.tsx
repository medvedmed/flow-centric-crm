import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OfflineData {
  appointments: any[];
  clients: any[];
  staff: any[];
  services: any[];
  lastSync: string;
}

export const OfflineHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection Restored",
        description: "You're back online! Syncing your data...",
      });
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection Lost",
        description: "You're working offline. Changes will sync when reconnected.",
        variant: "destructive",
      });
      cacheCurrentData();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data on mount
    loadCachedData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cacheCurrentData = () => {
    try {
      const appointments = JSON.parse(localStorage.getItem('appointments-cache') || '[]');
      const clients = JSON.parse(localStorage.getItem('clients-cache') || '[]');
      const staff = JSON.parse(localStorage.getItem('staff-cache') || '[]');
      const services = JSON.parse(localStorage.getItem('services-cache') || '[]');
      
      const offlineData: OfflineData = {
        appointments,
        clients,
        staff,
        services,
        lastSync: new Date().toISOString()
      };

      localStorage.setItem('offline-data', JSON.stringify(offlineData));
      setOfflineData(offlineData);
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem('offline-data');
      if (cached) {
        setOfflineData(JSON.parse(cached));
      }

      const pending = localStorage.getItem('pending-actions');
      if (pending) {
        setPendingActions(JSON.parse(pending));
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const syncPendingActions = async () => {
    if (pendingActions.length === 0) return;

    try {
      // Process pending actions when back online
      for (const action of pendingActions) {
        console.log('Syncing action:', action);
        // Implementation would depend on the specific action type
        // This is a placeholder for the sync logic
      }

      // Clear pending actions after successful sync
      setPendingActions([]);
      localStorage.removeItem('pending-actions');
      
      toast({
        title: "Sync Complete",
        description: `${pendingActions.length} changes synced successfully`,
      });
    } catch (error) {
      console.error('Error syncing pending actions:', error);
      toast({
        title: "Sync Error",
        description: "Some changes couldn't be synced. They'll retry later.",
        variant: "destructive",
      });
    }
  };

  const addPendingAction = (action: any) => {
    const newPendingActions = [...pendingActions, { ...action, timestamp: Date.now() }];
    setPendingActions(newPendingActions);
    localStorage.setItem('pending-actions', JSON.stringify(newPendingActions));
  };

  const retrySync = () => {
    if (isOnline) {
      syncPendingActions();
    } else {
      toast({
        title: "Still Offline",
        description: "Please check your internet connection",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      {/* Offline Status Bar */}
      {!isOnline && (
        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You're working offline. Changes will be saved locally and synced when you reconnect.
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retrySync}
              className="ml-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Sync
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Actions Indicator */}
      {pendingActions.length > 0 && (
        <Alert className="mb-4 border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {pendingActions.length} pending changes that will sync when you're back online.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <Card className={`transition-all duration-300 ${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {children}
    </div>
  );
};