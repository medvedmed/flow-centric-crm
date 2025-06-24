
// Utility function to normalize time format for comparison
export const normalizeTime = (time: string): string => {
  if (!time) return '';
  // Handle both HH:MM and HH:MM:SS formats
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
};

export const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Generate time slots from 8 AM to 8 PM
export const generateTimeSlots = () => {
  const timeSlots = [];
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push({
        time: timeString,
        hour,
        minute
      });
    }
  }
  return timeSlots;
};
