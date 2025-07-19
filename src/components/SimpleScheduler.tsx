// src/components/SimpleScheduler.tsx
import React from 'react';
import { parseISO, differenceInMinutes } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Appointment, Staff } from '@/services/types';

interface SimpleSchedulerProps {
  staff: Staff[];
  appointments: Appointment[];
  selectedDate: Date;
  onAppointmentClick: (appointment: Appointment) => void;
}

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      slots.push({ time, hour, minute });
    }
  }
  return slots;
};

const normalizeTime = (time: string) => {
  if (!time) return '';
  return time.length === 5 ? time : time.padStart(5, '0');
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

const statusColors = {
  Scheduled: 'bg-blue-50 border-l-blue-500 text-blue-900',
  Confirmed: 'bg-green-50 border-l-green-500 text-green-900',
  'In Progress': 'bg-purple-50 border-l-purple-500 text-purple-900',
  Completed: 'bg-gray-50 border-l-gray-500 text-gray-900',
  Cancelled: 'bg-red-50 border-l-red-500 text-red-900',
  'No Show': 'bg-orange-50 border-l-orange-500 text-orange-900',
};

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-red-100 text-red-800',
  partial: 'bg-yellow-100 text-yellow-800',
};

export const SimpleScheduler: React.FC<SimpleSchedulerProps> = ({
  staff,
  appointments,
  selectedDate,
  onAppointmentClick,
}) => {
  const timeSlots = generateTimeSlots();

  const handleAppointmentClick = (apt: Appointment) => {
    console.log('Appointment clicked:', apt);
    onAppointmentClick(apt);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Debug Info */}
      <div className="bg-gray-100 p-2 text-xs text-gray-600 border-b">
        <p>
          Total appointments: {appointments.length} | Staff: {staff.length} |
          Date: {selectedDate.toDateString()}
        </p>
      </div>

      {/* Staff Header */}
      <div
        className="sticky top-0 z-20 bg-white border-b-2 border-gray-400 shadow-sm flex-shrink-0"
        style={{
          display: 'grid',
          gridTemplateColumns: `100px repeat(${staff.length}, 1fr)`,
        }}
      >
        <div className="p-2 border-r-2 border-gray-400 bg-gray-100 flex items-center justify-center">
          <span className="font-bold text-gray-800 text-xs">TIME</span>
        </div>
        {staff.map(member => (
          <div
            key={member.id}
            className="p-2 border-r-2 border-gray-400 last:border-r-0 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
          >
            <div className="flex flex-col items-center gap-1">
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarImage
                  src={
                    member.imageUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                  }
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-gray-800 text-xs truncate">
                {member.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div
        className="flex-1 overflow-y-auto relative"
        style={{
          display: 'grid',
          gridTemplateColumns: `100px repeat(${staff.length}, 1fr)`,
          gridAutoRows: '60px', // each 30-min slot = 60px
        }}
      >
        {/* Time labels */}
        {timeSlots.map((ts, idx) => (
          <div
            key={ts.time}
            className="sticky left-0 z-10 p-2 border-b border-gray-300 bg-gray-100 text-xs font-semibold text-gray-800"
            style={{
              gridColumn: 1,
              gridRow: idx + 1,
            }}
          >
            {ts.time}
          </div>
        ))}

        {/* Appointments */}
        {appointments.map(apt => {
          const start = parseISO(apt.startTime);
          const end = parseISO(apt.endTime);
          const slotCount = differenceInMinutes(end, start) / 30;
          const staffIndex = staff.findIndex(s => s.id === apt.staffId);
          const startSlot =
            (start.getHours() - 9) * 2 + start.getMinutes() / 30 + 1;

          return (
            <div
              key={apt.id}
              onClick={() => handleAppointmentClick(apt)}
              className={`cursor-pointer rounded-md border-l-4 p-2 mb-1 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                statusColors[apt.status as keyof typeof statusColors] ||
                statusColors.Scheduled
              }`}
              style={{
                gridColumn: staffIndex + 2,
                gridRow: `${startSlot} / span ${slotCount}`,
              }}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold truncate">
                      {normalizeTime(apt.startTime)}-
                      {normalizeTime(apt.endTime)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {apt.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  <p className="font-medium text-sm truncate">
                    {apt.clientName}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-700 truncate flex-1">
                    {apt.service}
                  </p>
                  <div className="flex items-center gap-1 ml-2">
                    <DollarSign className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">
                      ${Number(apt.price || 0).toFixed(0)}
                    </span>
                  </div>
                </div>

                {apt.clientPhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate">
                      {apt.clientPhone}
                    </span>
                  </div>
                )}

                {apt.paymentStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Payment:</span>
                    <Badge
                      className={`text-xs px-1 py-0 ${
                        paymentStatusColors[
                          apt.paymentStatus as keyof typeof paymentStatusColors
                        ] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {apt.paymentStatus.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
