
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import AppHeader from "@/components/AppHeader"
import ProtectedRoute from "@/components/ProtectedRoute"
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
import Finance from "@/pages/Finance"
import "./App.css"

const queryClient = new QueryClient()

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StaffAuthProvider>
            <LanguageProvider>
              <TooltipProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/invite/:inviteToken" element={<InviteAccept />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/appointments" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Appointments />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/clients" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Clients />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/staff" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Staff />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/services" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Services />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/finance" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Finance />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/inventory" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Inventory />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Reports />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Settings />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/help" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Help />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/webhook-test" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <WebhookTest />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
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

// Layout component for authenticated pages
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default App;
