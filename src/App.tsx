
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppHeader from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import Staff from "./pages/Staff";
import Services from "./pages/Services";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import WebhookTest from "./pages/WebhookTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full bg-gray-50/40">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <AppHeader />
                      <main className="flex-1 p-6">
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/appointments" element={<Appointments />} />
                          <Route path="/clients" element={<Clients />} />
                          <Route path="/staff" element={<Staff />} />
                          <Route path="/services" element={<Services />} />
                          <Route path="/inventory" element={<Inventory />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/help" element={<Help />} />
                          <Route path="/webhook-test" element={<WebhookTest />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
