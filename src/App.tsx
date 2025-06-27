
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { StaffAuthProvider } from "./hooks/useStaffAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AppWithRealTime from "./components/AppWithRealTime";
import Landing from "./pages/Landing";
import { EnhancedAuthForm } from "./components/EnhancedAuthForm";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StaffAuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <BrowserRouter>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<EnhancedAuthForm />} />
                    <Route path="/*" element={<AuthenticatedApp />} />
                  </Routes>
                </ErrorBoundary>
              </BrowserRouter>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </LanguageProvider>
        </StaffAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthenticatedApp() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your salon dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppWithRealTime>{null}</AppWithRealTime>;
}

export default App;
