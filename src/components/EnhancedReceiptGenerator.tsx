
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { receiptApi } from '@/services/api/receiptApi';
import { toast } from '@/hooks/use-toast';
import { Printer, Download, Eye } from 'lucide-react';

interface ReceiptGeneratorProps {
  appointmentId: string;
  appointmentData?: any;
}

export const EnhancedReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ 
  appointmentId, 
  appointmentData 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Fetch available templates
  const { data: templates } = useQuery({
    queryKey: ['receipt-templates'],
    queryFn: receiptApi.getTemplates
  });

  // Fetch default template
  const { data: defaultTemplate } = useQuery({
    queryKey: ['default-receipt-template'],
    queryFn: receiptApi.getDefaultTemplate
  });

  const generateReceipt = async (templateId?: string) => {
    try {
      const template = templateId || defaultTemplate?.id;
      const data = await receiptApi.generateReceiptData(appointmentId, template);
      setReceiptData(data);
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate receipt",
        variant: "destructive",
      });
      return null;
    }
  };

  const handlePreview = async () => {
    const data = await generateReceipt(selectedTemplate);
    if (data) {
      setIsPreviewOpen(true);
    }
  };

  const handlePrint = async () => {
    const data = await generateReceipt(selectedTemplate);
    if (data) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .receipt { max-width: 400px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .line-item { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { border-top: 1px solid #ccc; padding-top: 10px; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="header">
                  <h2>${data.salon.name}</h2>
                  <p>${data.salon.address}</p>
                  <p>${data.salon.phone}</p>
                </div>
                <hr>
                <p><strong>Date:</strong> ${data.appointment.date}</p>
                <p><strong>Time:</strong> ${data.appointment.time}</p>
                <p><strong>Client:</strong> ${data.appointment.client_name}</p>
                <p><strong>Staff:</strong> ${data.appointment.staff_name}</p>
                <hr>
                ${data.services.map((service: any) => `
                  <div class="line-item">
                    <span>${service.name}</span>
                    <span>$${service.price.toFixed(2)}</span>
                  </div>
                `).join('')}
                <div class="line-item total">
                  <span>Total:</span>
                  <span>$${data.total.toFixed(2)}</span>
                </div>
                <div class="footer">
                  <p>Thank you for visiting ${data.salon.name}!</p>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownload = async () => {
    const data = await generateReceipt(selectedTemplate);
    if (data) {
      // Create a simple text receipt for download
      const receiptText = `
${data.salon.name}
${data.salon.address}
${data.salon.phone}

Date: ${data.appointment.date}
Time: ${data.appointment.time}
Client: ${data.appointment.client_name}
Staff: ${data.appointment.staff_name}

Services:
${data.services.map((service: any) => `${service.name} - $${service.price.toFixed(2)}`).join('\n')}

Total: $${data.total.toFixed(2)}

Thank you for choosing ${data.salon.name}!
      `;

      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${appointmentId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Generate Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePreview} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownload} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-4 p-4 border rounded">
              <div className="text-center">
                <h3 className="font-bold">{receiptData.salon.name}</h3>
                <p className="text-sm">{receiptData.salon.address}</p>
                <p className="text-sm">{receiptData.salon.phone}</p>
              </div>
              <hr />
              <div className="space-y-1">
                <p><strong>Date:</strong> {receiptData.appointment.date}</p>
                <p><strong>Time:</strong> {receiptData.appointment.time}</p>
                <p><strong>Client:</strong> {receiptData.appointment.client_name}</p>
                <p><strong>Staff:</strong> {receiptData.appointment.staff_name}</p>
              </div>
              <hr />
              <div className="space-y-2">
                {receiptData.services.map((service: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>{service.name}</span>
                    <span>${service.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${receiptData.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-center text-sm">
                <p>Thank you for visiting {receiptData.salon.name}!</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
