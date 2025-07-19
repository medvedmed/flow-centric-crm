
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

// Enhanced time slot generation with custom start/end hours and better formatting
export const generateTimeSlots = (startHour: number = 8, endHour: number = 20) => {
  const timeSlots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    // Add full hour slot
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    const displayTime = formatTimeForDisplay(timeString);
    timeSlots.push({
      time: timeString,
      display: displayTime,
      hour,
      minute: 0,
      isFullHour: true
    });
    
    // Add half-hour slot
    const halfHourString = `${hour.toString().padStart(2, '0')}:30`;
    timeSlots.push({
      time: halfHourString,
      display: formatTimeForDisplay(halfHourString),
      hour,
      minute: 30,
      isFullHour: false
    });
  }
  return timeSlots;
};

// Format time for better display (like Google Calendar)
export const formatTimeForDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  if (minutes === 0) {
    return `${hour12} ${ampm}`;
  }
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};
