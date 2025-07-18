
import React from 'react';

interface AppointmentSummaryProps {
  basePrice: number;
  extraServicesPrice: number;
  productsPrice?: number;
  totalDuration: number;
}

export const AppointmentSummary: React.FC<AppointmentSummaryProps> = ({
  basePrice,
  extraServicesPrice,
  productsPrice = 0,
  totalDuration
}) => {
  const finalTotalPrice = basePrice + extraServicesPrice + productsPrice;

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Base Service:</span>
          <span>${basePrice.toFixed(2)}</span>
        </div>
        {extraServicesPrice > 0 && (
          <div className="flex justify-between">
            <span>Extra Services:</span>
            <span>${extraServicesPrice.toFixed(2)}</span>
          </div>
        )}
        {productsPrice > 0 && (
          <div className="flex justify-between">
            <span>Products:</span>
            <span>${productsPrice.toFixed(2)}</span>
          </div>
        )}
        <hr className="border-gray-300" />
      </div>
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
