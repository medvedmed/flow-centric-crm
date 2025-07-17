
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Staff {
  id: string;
  name: string;
}

interface AppointmentBasicInfoProps {
  clientName: string;
  clientPhone: string;
  service: string;
  staffId: string;
  services: Service[];
  staff: Staff[];
}

export const AppointmentBasicInfo: React.FC<AppointmentBasicInfoProps> = ({
  clientName,
  clientPhone,
  service,
  staffId,
  services,
  staff
}) => {
  return (
    <>
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client_name">Client Name</Label>
          <Input
            id="client_name"
            name="client_name"
            defaultValue={clientName}
            required
          />
        </div>
        <div>
          <Label htmlFor="client_phone">Client Phone</Label>
          <Input
            id="client_phone"
            name="client_phone"
            defaultValue={clientPhone || ''}
            type="tel"
          />
        </div>
      </div>

      {/* Service and Staff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="service">Service</Label>
          <Select name="service" defaultValue={service}>
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.name}>
                  {service.name} - ${service.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="staff_id">Staff Member</Label>
          <Select name="staff_id" defaultValue={staffId || 'unassigned'}>
            <SelectTrigger>
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {staff.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
