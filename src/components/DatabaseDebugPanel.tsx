
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, RefreshCw, AlertTriangle } from 'lucide-react';

export const DatabaseDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const runDatabaseDiagnostics = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', user.id);

      // Check staff
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('salon_id', user.id);

      // Check clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('salon_id', user.id);

      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const diagnostics = {
        userId: user.id,
        userEmail: user.email,
        appointments: {
          count: appointments?.length || 0,
          error: appointmentsError?.message,
          sample: appointments?.slice(0, 2)
        },
        staff: {
          count: staff?.length || 0,
          error: staffError?.message,
          sample: staff?.slice(0, 2)
        },
        clients: {
          count: clients?.length || 0,
          error: clientsError?.message,
          sample: clients?.slice(0, 2)
        },
        profile: {
          exists: !!profile,
          error: profileError?.message,
          data: profile
        }
      };

      setDebugInfo(diagnostics);
      console.log('Database diagnostics:', diagnostics);

      toast({
        title: "Diagnostics Complete",
        description: `Found ${diagnostics.appointments.count} appointments, ${diagnostics.staff.count} staff, ${diagnostics.clients.count} clients`,
      });

    } catch (error) {
      console.error('Diagnostics error:', error);
      toast({
        title: "Diagnostics Failed",
        description: error instanceof Error ? error.message : "Failed to run diagnostics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDatabaseDiagnostics} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Run Database Diagnostics
            </>
          )}
        </Button>

        {debugInfo && (
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <strong>User Info:</strong>
              <div>ID: {debugInfo.userId}</div>
              <div>Email: {debugInfo.userEmail}</div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded">
              <strong>Data Counts:</strong>
              <div>Appointments: {debugInfo.appointments.count}</div>
              <div>Staff: {debugInfo.staff.count}</div>
              <div>Clients: {debugInfo.clients.count}</div>
              <div>Profile exists: {debugInfo.profile.exists ? 'Yes' : 'No'}</div>
            </div>

            {(debugInfo.appointments.error || debugInfo.staff.error || debugInfo.clients.error || debugInfo.profile.error) && (
              <div className="p-3 bg-red-50 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <strong className="text-red-700">Errors Found:</strong>
                </div>
                {debugInfo.appointments.error && <div>Appointments: {debugInfo.appointments.error}</div>}
                {debugInfo.staff.error && <div>Staff: {debugInfo.staff.error}</div>}
                {debugInfo.clients.error && <div>Clients: {debugInfo.clients.error}</div>}
                {debugInfo.profile.error && <div>Profile: {debugInfo.profile.error}</div>}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
