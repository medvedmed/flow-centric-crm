
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateClient } from '@/hooks/useCrmData';

interface ClientData {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export const ClientImportDialog = () => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createClient = useCreateClient();

  const downloadTemplate = () => {
    const csvContent = 'name,email,phone,notes\nJohn Doe,john@example.com,+1234567890,Regular customer\nJane Smith,jane@example.com,+0987654321,Prefers evening appointments';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): ClientData[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIndex = headers.indexOf('name');
    const emailIndex = headers.indexOf('email');
    const phoneIndex = headers.indexOf('phone');
    const notesIndex = headers.indexOf('notes');

    if (nameIndex === -1 || emailIndex === -1) {
      throw new Error('CSV must contain "name" and "email" columns');
    }

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (!values[nameIndex] || !values[emailIndex]) {
        throw new Error(`Row ${index + 2}: Name and email are required`);
      }

      return {
        name: values[nameIndex],
        email: values[emailIndex],
        phone: phoneIndex !== -1 ? values[phoneIndex] : undefined,
        notes: notesIndex !== -1 ? values[notesIndex] : undefined,
      };
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      const text = await file.text();
      const clients = parseCSV(text);

      for (const clientData of clients) {
        try {
          await createClient.mutateAsync({
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone || '',
            notes: clientData.notes || '',
            status: 'New',
            isPortalEnabled: false,
          });
          successCount++;
        } catch (error) {
          errors.push(`${clientData.name} (${clientData.email}): ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setImportResults({ success: successCount, errors });

      if (successCount > 0) {
        toast({
          title: 'Import completed',
          description: `Successfully imported ${successCount} clients${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        });
      }

    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to process file',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Import Clients
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Import Clients from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple clients at once. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div>
            <Label htmlFor="csvFile">Select CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
          </div>

          {importResults && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium text-green-600">
                Successfully imported: {importResults.success} clients
              </p>
              {importResults.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-red-600">
                    Errors ({importResults.errors.length}):
                  </p>
                  <ul className="text-sm text-red-600 list-disc list-inside max-h-32 overflow-y-auto">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
