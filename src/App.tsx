
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/hooks/useAuth';
import { StaffAuthProvider } from '@/hooks/useStaffAuth';
import { AutoRefreshProvider } from '@/components/AutoRefreshProvider';
import AppWithRealTime from '@/components/AppWithRealTime';

// Pages
import Index from '@/pages/Index';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Appointments from '@/pages/Appointments';
import Clients from '@/pages/Clients';
import Staff from '@/pages/Staff';
import Services from '@/pages/Services';
import Products from '@/pages/Products';
import Inventory from '@/pages/Inventory';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Help from '@/pages/Help';
import NotFound from '@/pages/NotFound';
import InviteAccept from '@/pages/InviteAccept';
import WebhookTest from '@/pages/WebhookTest';
import Finance from '@/pages/Finance';
import EnhancedFinance from '@/pages/EnhancedFinance';
import FinanceAnalytics from '@/pages/FinanceAnalytics';
import ClientRetention from '@/pages/ClientRetention';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <AutoRefreshProvider>
            <StaffAuthProvider>
              <Router>
                <SidebarProvider>
                  <AppWithRealTime>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/landing" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/client-retention" element={<ClientRetention />} />
                    <Route path="/staff" element={<Staff />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/enhanced-finance" element={<EnhancedFinance />} />
                    <Route path="/finance-analytics" element={<FinanceAnalytics />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/invite-accept" element={<InviteAccept />} />
                    <Route path="/webhook-test" element={<WebhookTest />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppWithRealTime>
              </SidebarProvider>
            </Router>
          </StaffAuthProvider>
        </AutoRefreshProvider>
      </AuthProvider>
      </LanguageProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
