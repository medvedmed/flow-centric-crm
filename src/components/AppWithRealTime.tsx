
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

interface AppWithRealTimeProps {
  children: React.ReactNode;
}

const AppWithRealTime = ({ children }: AppWithRealTimeProps) => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { isStaff, isLoading: staffLoading } = useStaffAuth();
  
  const isLoading = authLoading || staffLoading;
  const isAuthenticated = user || isStaff;
  
  // Pages that should not show the sidebar (login, index, etc.)
  const noSidebarPages = ['/', '/auth', '/invite-accept'];
  const shouldShowSidebar = isAuthenticated && !noSidebarPages.includes(location.pathname);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // For pages without sidebar (login, index, etc.)
  if (!shouldShowSidebar) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // For authenticated pages with sidebar
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-gray-50 p-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

export default AppWithRealTime;
