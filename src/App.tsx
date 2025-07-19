
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppHeader from "@/components/AppHeader";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import Staff from "./pages/Staff";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import ClientRetention from "./pages/ClientRetention";
import ActivityLog from "./pages/ActivityLog";

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthForm onAuthSuccess={() => {}} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider 
              open={sidebarOpen} 
              onOpenChange={setSidebarOpen}
            >
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                  <AppHeader />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/appointments" 
                        element={
                          <ProtectedRoute>
                            <Appointments />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/clients" 
                        element={
                          <ProtectedRoute>
                            <Clients />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/client-retention" 
                        element={
                          <ProtectedRoute>
                            <ClientRetention />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/staff" 
                        element={
                          <ProtectedRoute>
                            <Staff />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/activity-log" 
                        element={
                          <ProtectedRoute>
                            <ActivityLog />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/services" 
                        element={
                          <ProtectedRoute>
                            <Services />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/products" 
                        element={
                          <ProtectedRoute>
                            <Products />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/inventory" 
                        element={
                          <ProtectedRoute>
                            <Inventory />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/reports" 
                        element={
                          <ProtectedRoute>
                            <Reports />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/finance" 
                        element={
                          <ProtectedRoute>
                            <Finance />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/settings" 
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/help" 
                        element={
                          <ProtectedRoute>
                            <Help />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
