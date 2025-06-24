
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import AppHeader from "@/components/AppHeader"
import ProtectedRoute from "@/components/ProtectedRoute"
import AppWithRealTime from "@/components/AppWithRealTime"
import { AuthProvider } from "@/hooks/useAuth"
import { StaffAuthProvider } from "@/hooks/useStaffAuth"
import { LanguageProvider } from "@/contexts/LanguageContext"
import Index from "./pages/Index"
import Dashboard from "./pages/Dashboard"
import Appointments from "./pages/Appointments"
import Clients from "./pages/Clients"
import Services from "./pages/Services"
import Staff from "./pages/Staff"
import Inventory from "./pages/Inventory"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import Help from "./pages/Help"
import NotFound from "./pages/NotFound"
import InviteAccept from "./pages/InviteAccept"
import WebhookTest from "./pages/WebhookTest"
import "./App.css"
import Finance from "@/pages/Finance";

const queryClient = new QueryClient()

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StaffAuthProvider>
            <LanguageProvider>
              <TooltipProvider>
                <SidebarProvider>
                  <div className="min-h-screen bg-background flex w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <AppHeader />
                      <main className="flex-1 overflow-auto">
                        <Routes>
                          <Route path="/" element={
                            <AppWithRealTime>
                              <Dashboard />
                            </AppWithRealTime>
                          } />
                          <Route path="/appointments" element={
                            <AppWithRealTime>
                              <Appointments />
                            </AppWithRealTime>
                          } />
                          <Route path="/clients" element={
                            <AppWithRealTime>
                              <Clients />
                            </AppWithRealTime>
                          } />
                          <Route path="/staff" element={
                            <AppWithRealTime>
                              <Staff />
                            </AppWithRealTime>
                          } />
                          <Route path="/services" element={
                            <AppWithRealTime>
                              <Services />
                            </AppWithRealTime>
                          } />
                          <Route path="/finance" element={
                            <AppWithRealTime>
                              <Finance />
                            </AppWithRealTime>
                          } />
                          <Route path="/inventory" element={
                            <AppWithRealTime>
                              <Inventory />
                            </AppWithRealTime>
                          } />
                          <Route path="/reports" element={
                            <AppWithRealTime>
                              <Reports />
                            </AppWithRealTime>
                          } />
                          <Route path="/settings" element={
                            <AppWithRealTime>
                              <Settings />
                            </AppWithRealTime>
                          } />
                          <Route path="/help" element={
                            <AppWithRealTime>
                              <Help />
                            </AppWithRealTime>
                          } />
                          <Route path="/webhook-test" element={
                            <AppWithRealTime>
                              <WebhookTest />
                            </AppWithRealTime>
                          } />
                          <Route path="/invite/:inviteToken" element={<InviteAccept />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </TooltipProvider>
            </LanguageProvider>
          </StaffAuthProvider>
        </AuthProvider>
        <Toaster />
        <Sonner />
      </QueryClientProvider>
    </Router>
  );
}

export default App;
