
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { receiptApi } from '@/services/api/receiptApi';
import { enhancedAppointmentApi } from '@/services/api/enhancedAppointmentApi';

interface ReceiptData {
  appointment: any;
  services: any[];
  salon: any;
  staff?: any;
  template?: any;
}

interface ReceiptPrinterProps {
  appointmentId: string;
  templateId?: string;
  trigger?: React.ReactNode;
}

const ReceiptTemplate: React.FC<{ data: ReceiptData }> = ({ data }) => {
  const { appointment, services, salon, staff, template } = data;
  
  const totalAmount = services.reduce((sum, service) => sum + Number(service.service_price), 0);
  const appointmentDate = new Date(`${appointment.date} ${appointment.start_time}`);

  return (
    <div className="max-w-md mx-auto bg-white p-6 font-mono text-sm" id="receipt-content">
      {/* Header */}
      <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
        {template?.logo_url && (
          <img src={template.logo_url} alt="Salon Logo" className="w-16 h-16 mx-auto mb-2" />
        )}
        <h1 className="text-lg font-bold">{salon?.salon_name || salon?.full_name || 'Salon'}</h1>
        {template?.header_text && (
          <p className="text-gray-600 mt-1">{template.header_text}</p>
        )}
        {template?.include_salon_info && salon && (
          <div className="text-xs text-gray-500 mt-2">
            {salon.address && <div>{salon.address}</div>}
            {salon.phone && <div>Tel: {salon.phone}</div>}
            {salon.email && <div>Email: {salon.email}</div>}
          </div>
        )}
      </div>

      {/* Receipt Info */}
      <div className="mb-4 space-y-1">
        <div className="flex justify-between">
          <span>Receipt #:</span>
          <span className="font-medium">{appointment.id.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{format(appointmentDate, 'MMM d, yyyy')}</span>
        </div>
        <div className="flex justify-between">
          <span>Time:</span>
          <span>{format(appointmentDate, 'h:mm a')}</span>
        </div>
        <div className="flex justify-between">
          <span>Client:</span>
          <span className="font-medium">{appointment.client_name}</span>
        </div>
        {template?.include_staff_name && staff && (
          <div className="flex justify-between">
            <span>Staff:</span>
            <span>{staff.name}</span>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Services */}
      {template?.include_service_details && (
        <div className="mb-4">
          <h3 className="font-bold mb-2">Services</h3>
          {services.map((service, index) => (
            <div key={index} className="flex justify-between mb-1">
              <div className="flex-1">
                <div>{service.service_name}</div>
                <div className="text-xs text-gray-500">
                  {service.service_duration} minutes
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">${Number(service.service_price).toFixed(2)}</div>
              </div>
            </div>
          ))}
          <Separator className="my-2" />
        </div>
      )}

      {/* Total */}
      <div className="mb-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        <div>Thank you for visiting!</div>
        {template?.footer_text && (
          <div className="mt-2">{template.footer_text}</div>
        )}
        <div className="mt-2">
          Printed on {format(new Date(), 'MMM d, yyyy h:mm a')}
        </div>
      </div>
    </div>
  );
};

export const ReceiptPrinter: React.FC<ReceiptPrinterProps> = ({
  appointmentId,
  templateId,
  trigger
}) => {
  const { data: receiptData, isLoading } = useQuery({
    queryKey: ['receipt-data', appointmentId, templateId],
    queryFn: () => receiptApi.generateReceiptData(appointmentId, templateId),
    enabled: !!appointmentId,
  });

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; }
                @media print {
                  body { margin: 0; padding: 0; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownloadPDF = async () => {
    // Simple PDF generation using browser's print-to-PDF
    const printContent = document.getElementById('receipt-content');
    if (printContent && 'showSaveFilePicker' in window) {
      try {
        window.print();
      } catch (error) {
        console.error('PDF download failed:', error);
      }
    } else {
      // Fallback to print dialog
      handlePrint();
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Receipt className="w-4 h-4 mr-2" />
      Print Receipt
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : receiptData ? (
          <div className="space-y-4">
            <ReceiptTemplate data={receiptData} />
            
            <div className="flex gap-2 justify-center border-t pt-4">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Failed to load receipt data
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
