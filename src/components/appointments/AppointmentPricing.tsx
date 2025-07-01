
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AppointmentPricingProps {
  price: number;
  duration: number;
  onPriceChange: (price: number) => void;
}

export const AppointmentPricing: React.FC<AppointmentPricingProps> = ({
  price,
  duration,
  onPriceChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="price">Base Price ($)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
          required
        />
      </div>
      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          name="duration"
          type="number"
          defaultValue={duration || 60}
          required
        />
      </div>
    </div>
  );
};
