
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent,  DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const DataCleanupDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCleanupTestData = async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete test appointments - using organization_id and client_id references
      const { error: appointmentsError } = await supabase
        .from('appointments')
        .delete()
        .eq('organization_id', user.id)
        .is('client_id', null);

      if (appointmentsError) {
        console.error('Appointments cleanup error:', appointmentsError);
      }

      // Delete test clients with generic names using full_name column
      const testNames = ['mohf', 'hhhh', 'test', 'Test', 'TEST', 'aaa', 'bbb', 'ccc', 'ddd', 'eee'];
      const { error: clientsError } = await supabase
        .from('clients')
        .delete()
        .eq('organization_id', user.id)
        .in('full_name', testNames);

      if (clientsError) {
        console.error('Clients cleanup error:', clientsError);
      }

      // Refresh all related queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

      toast({
        title: "Cleanup Complete",
        description: "Test data has been successfully removed from your system.",
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup Failed",
        description: error instanceof Error ? error.message : "Failed to clean up test data",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Clean Test Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Clean Up Test Data
          </DialogTitle>
          <DialogDescription>
            This will permanently delete appointments and clients with generic test names like "mohf", "hhhh", "test", etc.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This action cannot be undone. Only test data with obvious placeholder names will be removed.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCleanupTestData}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Cleaning...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Clean Test Data
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
