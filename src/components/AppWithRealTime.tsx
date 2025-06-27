
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger, SidebarProvider } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';
import Dashboard from '@/pages/Dashboard';
import Appointments from '@/pages/Appointments';
import Clients from '@/pages/Clients';
import Staff from '@/pages/Staff';
import Services from '@/pages/Services';
import Finance from '@/pages/Finance';
import Reports from '@/pages/Reports';
import EnhancedSettings from '@/pages/EnhancedSettings';

interface AppWithRealTimeProps {
  children: React.ReactNode;
}

const AppWithRealTime = ({ children }: AppWithRealTimeProps) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  
  // Pages that should not show the sidebar (login, index, etc.)
  const noSidebarPages = ['/', '/auth', '/invite-accept'];
  const shouldShowSidebar = user && !noSidebarPages.includes(location.pathname);

  // Show loading spinner while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span>Loading application...</span>
        </div>
      </div>
    );
  }

  // For pages without sidebar (login, index, etc.)
  if (!shouldShowSidebar) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full">
          {children}
        </div>
      </div>
    );
  }

  // For authenticated pages with sidebar - wrap with SidebarProvider
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email}
              </span>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[calc(100vh-5rem)] flex-1 rounded-xl bg-white p-4">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/services" element={<Services />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<EnhancedSettings />} />
              </Routes>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppWithRealTime;
