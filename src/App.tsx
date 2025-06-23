
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
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
import "./App.css"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StaffAuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/invite/:token" element={<InviteAccept />} />
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <AppWithRealTime>
                        <SidebarProvider>
                          <div className="min-h-screen flex w-full">
                            <AppSidebar />
                            <div className="flex-1 flex flex-col">
                              <AppHeader />
                              <main className="flex-1 p-6">
                                <Routes>
                                  <Route path="/dashboard" element={<Dashboard />} />
                                  <Route path="/appointments" element={<Appointments />} />
                                  <Route path="/clients" element={<Clients />} />
                                  <Route path="/services" element={<Services />} />
                                  <Route path="/staff" element={<Staff />} />
                                  <Route path="/inventory" element={<Inventory />} />
                                  <Route path="/reports" element={<Reports />} />
                                  <Route path="/settings" element={<Settings />} />
                                  <Route path="/help" element={<Help />} />
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
                              </main>
                            </div>
                          </div>
                        </SidebarProvider>
                      </AppWithRealTime>
                    </ProtectedRoute>
                  } />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </StaffAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
