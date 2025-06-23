
import React from 'react';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

interface AppWithRealTimeProps {
  children: React.ReactNode;
}

const AppWithRealTime = ({ children }: AppWithRealTimeProps) => {
  // Enable real-time updates only after authentication
  useRealTimeUpdates();
  
  return <>{children}</>;
};

export default AppWithRealTime;
