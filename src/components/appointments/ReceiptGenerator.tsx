
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Receipt } from 'lucide-react';
import { Appointment, Staff } from '@/services/types';
import { useToast } from '@/hooks/use-toast';

interface ReceiptGeneratorProps {
  appointment: Appointment;
  staff?: Staff[];
  salonInfo?: {
    name?: string;
    phone?: string;
    address?: string;
  };
}

export const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({
  appointment,
  staff = [],
  salonInfo
}) => {
  const { toast } = useToast();

  const generateTextReceipt = () => {
    const staffMember = staff.find(s => s.id === appointment.staffId);
    const receiptContent = `
${salonInfo?.name || 'SALON RECEIPT'}
${salonInfo?.address ? salonInfo.address : ''}
${salonInfo?.phone ? `Phone: ${salonInfo.phone}` : ''}
==========================================

APPOINTMENT RECEIPT

Date: ${new Date(appointment.date).toLocaleDateString()}
Time: ${appointment.startTime} - ${appointment.endTime}

Client Information:
- Name: ${appointment.clientName}
- Phone: ${appointment.clientPhone || 'N/A'}

Service Details:
- Service: ${appointment.service}
- Staff Member: ${staffMember?.name || 'N/A'}
- Duration: ${appointment.duration} minutes

Financial Information:
- Service Price: $${appointment.price?.toFixed(2)}
- Status: ${appointment.paymentStatus || 'unpaid'}
${appointment.paymentMethod ? `- Payment Method: ${appointment.paymentMethod}` : ''}
${appointment.paidAmount ? `- Amount Paid: $${appointment.paidAmount.toFixed(2)}` : ''}

${appointment.notes ? `Notes: ${appointment.notes}` : ''}

==========================================
Thank you for choosing our salon!

Generated: ${new Date().toLocaleString()}
Appointment ID: ${appointment.id}
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${appointment.clientName.replace(/\s+/g, '-')}-${appointment.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Receipt Downloaded",
      description: "Receipt has been saved to your downloads folder",
    });
  };

  const generatePDFReceipt = () => {
    // For now, we'll create an HTML receipt that can be printed as PDF
    const staffMember = staff.find(s => s.id === appointment.staffId);
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Receipt - ${appointment.clientName}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #8B5CF6; padding-bottom: 20px; margin-bottom: 20px; }
        .salon-name { font-size: 24px; font-weight: bold; color: #8B5CF6; }
        .receipt-title { font-size: 20px; margin: 20px 0; text-align: center; background: #8B5CF6; color: white; padding: 10px; }
        .section { margin: 15px 0; }
        .section-title { font-weight: bold; color: #6B46C1; margin-bottom: 8px; }
        .row { display: flex; justify-content: space-between; margin: 5px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="salon-name">${salonInfo?.name || 'Your Salon'}</div>
        ${salonInfo?.address ? `<div>${salonInfo.address}</div>` : ''}
        ${salonInfo?.phone ? `<div>Phone: ${salonInfo.phone}</div>` : ''}
    </div>
    
    <div class="receipt-title">APPOINTMENT RECEIPT</div>
    
    <div class="section">
        <div class="section-title">Appointment Details</div>
        <div class="row"><span>Date:</span><span>${new Date(appointment.date).toLocaleDateString()}</span></div>
        <div class="row"><span>Time:</span><span>${appointment.startTime} - ${appointment.endTime}</span></div>
        <div class="row"><span>Duration:</span><span>${appointment.duration} minutes</span></div>
    </div>
    
    <div class="section">
        <div class="section-title">Client Information</div>
        <div class="row"><span>Name:</span><span>${appointment.clientName}</span></div>
        <div class="row"><span>Phone:</span><span>${appointment.clientPhone || 'N/A'}</span></div>
    </div>
    
    <div class="section">
        <div class="section-title">Service Information</div>
        <div class="row"><span>Service:</span><span>${appointment.service}</span></div>
        <div class="row"><span>Staff Member:</span><span>${staffMember?.name || 'N/A'}</span></div>
    </div>
    
    <div class="section">
        <div class="section-title">Payment Information</div>
        <div class="row"><span>Service Price:</span><span>$${appointment.price?.toFixed(2)}</span></div>
        <div class="row"><span>Payment Status:</span><span>${appointment.paymentStatus || 'unpaid'}</span></div>
        ${appointment.paymentMethod ? `<div class="row"><span>Payment Method:</span><span>${appointment.paymentMethod}</span></div>` : ''}
        ${appointment.paidAmount ? `<div class="row"><span>Amount Paid:</span><span>$${appointment.paidAmount.toFixed(2)}</span></div>` : ''}
    </div>
    
    ${appointment.notes ? `
    <div class="section">
        <div class="section-title">Notes</div>
        <div>${appointment.notes}</div>
    </div>
    ` : ''}
    
    <div class="footer">
        <div>Thank you for choosing our salon!</div>
        <div>Generated: ${new Date().toLocaleString()}</div>
        <div>Appointment ID: ${appointment.id}</div>
    </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 100);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={generateTextReceipt}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download Receipt
      </Button>
      <Button 
        onClick={generatePDFReceipt}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Receipt className="w-4 h-4" />
        Print Receipt
      </Button>
    </div>
  );
};
