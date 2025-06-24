
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
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={
              <AppWithRealTime>
                <Dashboard />
              </AppWithRealTime>
            }>
              <Route index element={<Dashboard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="clients" element={<Clients />} />
              <Route path="staff" element={<Staff />} />
              <Route path="services" element={<Services />} />
              <Route path="finance" element={<Finance />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
              <Route path="webhook-test" element={<WebhookTest />} />
              <Route path="invite/:inviteToken" element={<InviteAccept />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </div>
        <Toaster />
      </QueryClientProvider>
    </Router>
  );
}

export default App;
