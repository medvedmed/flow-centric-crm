
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Staff from "./pages/Staff";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import WebhookTest from "./pages/WebhookTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-teal-50">
            <AppSidebar />
            <main className="flex-1 flex flex-col">
              <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="flex h-16 items-center px-6">
                  <SidebarTrigger className="mr-4" />
                  <div className="flex-1" />
                </div>
              </div>
              <div className="flex-1 p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/staff" element={<Staff />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/webhook-test" element={<WebhookTest />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
