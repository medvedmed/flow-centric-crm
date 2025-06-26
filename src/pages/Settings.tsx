
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Building, Shield, MessageSquare, Bell, Users, Calendar, UserCog, AlertCircle, BarChart3, Zap, Loader2, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminSetup } from "@/hooks/useAdminSetup";
import { useAuth } from "@/hooks/useAuth";
import { AdminSetupDialog } from "@/components/AdminSetupDialog";
import { EnhancedSalonProfile } from "@/components/EnhancedSalonProfile";
import { UnifiedRoleManagement } from "@/components/UnifiedRoleManagement";
import { WhatsAppSection } from "@/components/WhatsAppSection";
import { StaffScheduleSection } from "@/components/StaffScheduleSection";
import ManagerSection from "@/components/ManagerSection";
import { NotificationPreferences } from "@/components/NotificationPreferences";
import { BusinessAnalytics } from "@/components/BusinessAnalytics";
import { DatabaseDebugPanel } from "@/components/DatabaseDebugPanel";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { needsAdminSetup } = useAdminSetup();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasPermissionSync, isLoading: permissionsLoading, error } = usePermissions();
  const { toast } = useToast();
  const [showAdminDialog, setShowAdminDialog] = useState(needsAdminSetup);

  const isLoading = authLoading || permissionsLoading;

  // Show error if permissions failed to load
  useEffect(() => {
    if (error) {
      toast({
        title: "Permission Error",
        description: "Failed to load user permissions. Some features may not work correctly.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Check if user has settings permissions
  const canViewSettings = hasPermissionSync('settings', 'view');
  const canEditSettings = hasPermissionSync('settings', 'edit');
  const canViewReports = hasPermissionSync('reports', 'view');

  // Show loading screen while authentication is being verified
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  // Show authentication error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Authentication required. Please log in to access settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load settings. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!canViewSettings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      <AdminSetupDialog 
        open={showAdminDialog} 
        onClose={() => setShowAdminDialog(false)} 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Complete salon management, automation, and business insights.</p>
        </div>
      </div>

      <Tabs defaultValue="salon" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-9">
          <TabsTrigger value="salon" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span className="hidden sm:inline">Salon</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="manager" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            <span className="hidden sm:inline">Manager</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Automation</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Debug</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="salon" className="space-y-6">
          <EnhancedSalonProfile />
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <WhatsAppSection />
        </TabsContent>

        <TabsContent value="manager" className="space-y-6">
          {canEditSettings ? (
            <ManagerSection />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">You need edit permissions to access the Manager section.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          {canEditSettings ? (
            <UnifiedRoleManagement />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">You need edit permissions to manage roles and permissions.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          {canEditSettings ? (
            <StaffScheduleSection />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">You need edit permissions to manage staff schedules.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {canViewReports ? (
            <BusinessAnalytics />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">You need report permissions to view business analytics.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automation Hub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Smart Scheduling</h3>
                  <p className="text-sm text-gray-600 mb-3">Automatically suggest optimal appointment times based on staff availability and client preferences.</p>
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Coming Soon</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Auto Follow-ups</h3>
                  <p className="text-sm text-gray-600 mb-3">Send personalized follow-up messages and review requests automatically.</p>
                  <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Available in WhatsApp</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Predictive Analytics</h3>
                  <p className="text-sm text-gray-600 mb-3">AI-powered insights to predict busy periods and optimize staffing.</p>
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Coming Soon</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationPreferences />
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          <DatabaseDebugPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
