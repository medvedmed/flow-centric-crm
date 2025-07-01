
import React from 'react';

interface AppointmentSummaryProps {
  basePrice: number;
  extraServicesPrice: number;
  totalDuration: number;
}

export const AppointmentSummary: React.FC<AppointmentSummaryProps> = ({
  basePrice,
  extraServicesPrice,
  totalDuration
}) => {
  const finalTotalPrice = basePrice + extraServicesPrice;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-medium">Total Price:</span>
        <span className="text-lg font-bold text-green-600">${finalTotalPrice.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Total Duration:</span>
        <span>{totalDuration} minutes</span>
      </div>
    </div>
  );
};
