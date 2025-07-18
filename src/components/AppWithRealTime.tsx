import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';
interface AppWithRealTimeProps {
  children: React.ReactNode;
}
const AppWithRealTime = ({
  children
}: AppWithRealTimeProps) => {
  const location = useLocation();
  const {
    user,
    isLoading: authLoading
  } = useAuth();
  const {
    isStaff,
    isLoading: staffLoading
  } = useStaffAuth();

  // Enable real-time updates globally when authenticated
  const isAuthenticated = user || isStaff;
  useRealTimeUpdates();
  const isLoading = authLoading || staffLoading;

  // Pages that should not show the sidebar (login, index, etc.)
  const noSidebarPages = ['/', '/auth', '/invite-accept'];
  const shouldShowSidebar = isAuthenticated && !noSidebarPages.includes(location.pathname);

  // Show loading spinner while auth is being checked
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span>Loading application...</span>
        </div>
      </div>;
  }

  // For pages without sidebar (login, index, etc.)
  if (!shouldShowSidebar) {
    return <div className="min-h-screen bg-gray-50">
        <div className="w-full">
          {children}
        </div>
      </div>;
  }

  // For authenticated pages with sidebar
  return <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset className="flex-1">
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[calc(100vh-5rem)] flex-1 rounded-xl bg-white p-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </div>;
};
export default AppWithRealTime;