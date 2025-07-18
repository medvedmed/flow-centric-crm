
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Scissors, Clock, DollarSign, Percent } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface ServiceRowProps {
  selectedServiceId: string;
  onServiceChange: (serviceId: string) => void;
  serviceDuration: number;
  onDurationChange: (duration: number) => void;
  servicePrice: number;
  onPriceChange: (price: number) => void;
  discount: number;
  onDiscountChange: (discount: number) => void;
  services: Service[];
  appointmentService?: string;
  serviceTotal: number;
  productsTotal: number;
  finalTotal: number;
}

export const ServiceRow: React.FC<ServiceRowProps> = ({
  selectedServiceId,
  onServiceChange,
  serviceDuration,
  onDurationChange,
  servicePrice,
  onPriceChange,
  discount,
  onDiscountChange,
  services,
  appointmentService,
  serviceTotal,
  productsTotal,
  finalTotal
}) => {
  console.log('ServiceRow - selectedServiceId:', selectedServiceId, 'appointmentService:', appointmentService);

  const discountAmount = (servicePrice * discount) / 100;
  const currentService = services.find(s => s.id === selectedServiceId);
  const displayValue = selectedServiceId || (appointmentService ? 
    services.find(s => s.name === appointmentService)?.id || '' : '');

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-green-600" />
          <span className="text-lg font-semibold text-green-900">Service Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Service Selection - Takes more space */}
          <div className="lg:col-span-4">
            <Label className="text-sm font-medium text-gray-700">Service</Label>
            <Select value={displayValue} onValueChange={onServiceChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={appointmentService || "Select service"} />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium">{service.name}</span>
                      <span className="ml-4 text-sm text-gray-500">
                        ${service.price} • {service.duration}min
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {appointmentService && !currentService && (
              <p className="text-xs text-gray-500 mt-1">Current: {appointmentService}</p>
            )}
          </div>

          {/* Duration */}
          <div className="lg:col-span-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Duration (min)
            </Label>
            <Input
              type="number"
              value={serviceDuration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              min="1"
              className="w-full"
            />
          </div>

          {/* Price */}
          <div className="lg:col-span-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Price ($)
            </Label>
            <Input
              type="number"
              value={servicePrice}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>

          {/* Discount */}
          <div className="lg:col-span-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Percent className="w-3 h-3" />
              Discount (%)
            </Label>
            <Input
              type="number"
              value={discount}
              onChange={(e) => onDiscountChange(Number(e.target.value))}
              min="0"
              max="100"
              className="w-full"
            />
          </div>

          {/* Totals - More space and better layout */}
          <div className="lg:col-span-2">
            <div className="p-4 bg-white rounded-lg border border-gray-200 min-w-[200px]">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">${servicePrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount ({discount}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Total:</span>
                  <span className="font-medium">${serviceTotal.toFixed(2)}</span>
                </div>
                {productsTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Products:</span>
                    <span className="font-medium">${productsTotal.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total:</span>
                  <span className="text-green-600">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
