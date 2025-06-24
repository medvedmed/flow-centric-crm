
import React from 'react';

interface AppWithRealTimeProps {
  children: React.ReactNode;
}

const AppWithRealTime = ({ children }: AppWithRealTimeProps) => {
  // This component can be enhanced later with real-time functionality
  // For now, it just passes through the children
  return <>{children}</>;
};

export default AppWithRealTime;
