// Re-export all types
export * from './types';

// Re-export all API modules
export { profileApi } from './api/profileApi';
export { clientApi } from './api/clientApi';
export { staffApi } from './api/staffApi';
export { appointmentApi } from './api/appointmentApi';
export { timeOffApi } from './api/timeOffApi';
export { availabilityApi } from './api/availabilityApi';
export { analyticsApi } from './api/analyticsApi';
export { reportsApi } from './api/reportsApi';

// Re-export reminder API
export { reminderApi } from './api/reminderApi';

// Create the main supabaseApi object that maintains the existing interface
export const supabaseApi = {
  // Profile functions
  getProfile: () => import('./api/profileApi').then(m => m.profileApi.getProfile()),
  updateProfile: (profile: any) => import('./api/profileApi').then(m => m.profileApi.updateProfile(profile)),

  // Client functions
  getClients: (searchTerm?: string, page?: number, pageSize?: number, status?: string) => 
    import('./api/clientApi').then(m => m.clientApi.getClients(searchTerm, page, pageSize, status)),
  getClient: (id: string) => import('./api/clientApi').then(m => m.clientApi.getClient(id)),
  createClient: (client: any) => import('./api/clientApi').then(m => m.clientApi.createClient(client)),
  updateClient: (id: string, client: any) => import('./api/clientApi').then(m => m.clientApi.updateClient(id, client)),
  deleteClient: (id: string) => import('./api/clientApi').then(m => m.clientApi.deleteClient(id)),

  // Staff functions
  getStaff: (status?: string) => import('./api/staffApi').then(m => m.staffApi.getStaff(status)),
  createStaff: (staff: any) => import('./api/staffApi').then(m => m.staffApi.createStaff(staff)),
  updateStaff: (id: string, staff: any) => import('./api/staffApi').then(m => m.staffApi.updateStaff(id, staff)),
  deleteStaff: (id: string) => import('./api/staffApi').then(m => m.staffApi.deleteStaff(id)),
  createStaffWithRole: (staff: any, role?: 'staff' | 'receptionist') => 
    import('./api/staffApi').then(m => m.staffApi.createStaffWithRole(staff, role)),

  // Appointment functions
  getAppointments: (clientId?: string, staffId?: string, startDate?: string, endDate?: string, page?: number, pageSize?: number) =>
    import('./api/appointmentApi').then(m => m.appointmentApi.getAppointments(clientId, staffId, startDate, endDate, page, pageSize)),
  createAppointment: (appointment: any) => import('./api/appointmentApi').then(m => m.appointmentApi.createAppointment(appointment)),
  updateAppointment: (id: string, appointment: any) => import('./api/appointmentApi').then(m => m.appointmentApi.updateAppointment(id, appointment)),
  deleteAppointment: (id: string) => import('./api/appointmentApi').then(m => m.appointmentApi.deleteAppointment(id)),

  // Time-off functions
  getTimeOffRequests: (staffId?: string, status?: string) => 
    import('./api/timeOffApi').then(m => m.timeOffApi.getTimeOffRequests(staffId, status)),
  createTimeOffRequest: (request: any) => import('./api/timeOffApi').then(m => m.timeOffApi.createTimeOffRequest(request)),
  updateTimeOffRequest: (id: string, request: any) => import('./api/timeOffApi').then(m => m.timeOffApi.updateTimeOffRequest(id, request)),
  deleteTimeOffRequest: (id: string) => import('./api/timeOffApi').then(m => m.timeOffApi.deleteTimeOffRequest(id)),

  // Staff availability functions
  getStaffAvailability: (staffId?: string, date?: string) => 
    import('./api/availabilityApi').then(m => m.availabilityApi.getStaffAvailability(staffId, date)),
  createStaffAvailability: (availability: any) => import('./api/availabilityApi').then(m => m.availabilityApi.createStaffAvailability(availability)),
  updateStaffAvailability: (id: string, availability: any) => import('./api/availabilityApi').then(m => m.availabilityApi.updateStaffAvailability(id, availability)),
  deleteStaffAvailability: (id: string) => import('./api/availabilityApi').then(m => m.availabilityApi.deleteStaffAvailability(id)),

  // Reminder functions
  getReminderSettings: () => import('./api/reminderApi').then(m => m.reminderApi.getReminderSettings()),
  createReminderSettings: (settings: any) => import('./api/reminderApi').then(m => m.reminderApi.createReminderSettings(settings)),
  updateReminderSettings: (settings: any) => import('./api/reminderApi').then(m => m.reminderApi.updateReminderSettings(settings)),
  getAppointmentReminders: (status?: string) => import('./api/reminderApi').then(m => m.reminderApi.getAppointmentReminders(status)),
  updateReminderStatus: (id: string, status: 'sent' | 'skipped') => import('./api/reminderApi').then(m => m.reminderApi.updateReminderStatus(id, status)),
  processReminders: () => import('./api/reminderApi').then(m => m.reminderApi.processReminders()),

  // Analytics functions
  getClientStats: () => import('./api/analyticsApi').then(m => m.analyticsApi.getClientStats()),
  getCurrentUserPermissions: () => import('./api/analyticsApi').then(m => m.analyticsApi.getCurrentUserPermissions()),

  // Reports functions
  getRevenueData: (months?: number) => import('./api/reportsApi').then(m => m.reportsApi.getRevenueData(months)),
  getServicePopularity: () => import('./api/reportsApi').then(m => m.reportsApi.getServicePopularity()),
  getStaffPerformance: () => import('./api/reportsApi').then(m => m.reportsApi.getStaffPerformance()),
  getClientMetrics: () => import('./api/reportsApi').then(m => m.reportsApi.getClientMetrics()),
  exportReport: (type: 'revenue' | 'services' | 'staff' | 'clients') => import('./api/reportsApi').then(m => m.reportsApi.exportReport(type))
};
