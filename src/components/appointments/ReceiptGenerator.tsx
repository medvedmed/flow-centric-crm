
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { Appointment } from '@/services/types';

interface ReceiptGeneratorProps {
  appointment: Appointment;
}

export const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ appointment }) => {
  const generateReceipt = () => {
    const receiptContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt - ${appointment.clientName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .receipt-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        .receipt-header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 20px;
            background: white;
            border-radius: 20px 20px 0 0;
        }
        .salon-name {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .salon-tagline {
            font-size: 1rem;
            opacity: 0.9;
        }
        .receipt-body {
            padding: 40px 30px;
        }
        .receipt-title {
            text-align: center;
            font-size: 1.5rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 30px;
            position: relative;
        }
        .receipt-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-item {
            background: #f8f9ff;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .info-label {
            font-size: 0.85rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
        }
        .service-section {
            background: linear-gradient(135deg, #f8f9ff 0%, #e6e9ff 100%);
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
            border: 2px solid #e6e9ff;
        }
        .service-header {
            font-size: 1.2rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 15px;
            text-align: center;
        }
        .service-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .service-name {
            font-size: 1.1rem;
            font-weight: 600;
        }
        .service-price {
            font-size: 1.3rem;
            font-weight: bold;
            color: #667eea;
        }
        .payment-status {
            text-align: center;
            margin: 20px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.9rem;
        }
        .status-paid { background: #d4edda; color: #155724; }
        .status-partial { background: #fff3cd; color: #856404; }
        .status-unpaid { background: #f8d7da; color: #721c24; }
        .receipt-footer {
            background: #f8f9ff;
            padding: 20px 30px;
            text-align: center;
            border-top: 2px dashed #e6e9ff;
        }
        .thank-you {
            font-size: 1.2rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .footer-text {
            color: #666;
            font-size: 0.9rem;
        }
        .decorative-element {
            width: 50px;
            height: 3px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 15px auto;
            border-radius: 2px;
        }
        @media print {
            body { background: white; padding: 0; }
            .receipt-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="receipt-header">
            <div class="salon-name">Salon Management</div>
            <div class="salon-tagline">Professional Beauty Services</div>
        </div>
        
        <div class="receipt-body">
            <div class="receipt-title">Service Receipt</div>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Client Name</div>
                    <div class="info-value">${appointment.clientName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value">${appointment.clientPhone || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Date</div>
                    <div class="info-value">${new Date(appointment.date).toLocaleDateString()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Time</div>
                    <div class="info-value">${appointment.startTime}</div>
                </div>
            </div>
            
            <div class="service-section">
                <div class="service-header">Service Details</div>
                <div class="service-details">
                    <div class="service-name">${appointment.service}</div>
                    <div class="service-price">$${appointment.price?.toFixed(2) || '0.00'}</div>
                </div>
            </div>
            
            <div class="payment-status">
                <span class="status-badge status-${appointment.paymentStatus}">
                    Payment ${appointment.paymentStatus?.toUpperCase() || 'PENDING'}
                </span>
            </div>
            
            ${appointment.paymentMethod ? `
                <div class="info-item" style="margin: 20px auto; max-width: 300px;">
                    <div class="info-label">Payment Method</div>
                    <div class="info-value">${appointment.paymentMethod.toUpperCase()}</div>
                </div>
            ` : ''}
            
            ${appointment.notes ? `
                <div class="info-item" style="grid-column: span 2; margin-top: 20px;">
                    <div class="info-label">Notes</div>
                    <div class="info-value">${appointment.notes}</div>
                </div>
            ` : ''}
        </div>
        
        <div class="receipt-footer">
            <div class="thank-you">Thank You!</div>
            <div class="decorative-element"></div>
            <div class="footer-text">We appreciate your business and look forward to serving you again.</div>
        </div>
    </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Add a small delay before printing to ensure content is loaded
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <Button
      onClick={generateReceipt}
      variant="outline"
      className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-violet-50 hover:to-blue-50"
    >
      <Download className="w-4 h-4" />
      Download Receipt
    </Button>
  );
};
