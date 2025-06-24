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
export { serviceApi } from './api/serviceApi';
export { staffAvailabilityApi } from './api/staffAvailabilityApi';

// Re-export reminder API
export { reminderApi } from './api/reminderApi';

// Re-export new APIs
export { inventoryApi } from './api/inventoryApi';
export { financeApi } from './api/financeApi';
export { enhancedAppointmentApi } from './api/enhancedAppointmentApi';
export { receiptApi } from './api/receiptApi';
export { productSalesApi } from './api/productSalesApi';

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

  // Service functions
  getServices: (searchTerm?: string, category?: string, isActive?: boolean, page?: number, pageSize?: number) =>
    import('./api/serviceApi').then(m => m.serviceApi.getServices(searchTerm, category, isActive, page, pageSize)),
  getService: (id: string) => import('./api/serviceApi').then(m => m.serviceApi.getService(id)),
  createService: (service: any) => import('./api/serviceApi').then(m => m.serviceApi.createService(service)),
  updateService: (id: string, service: any) => import('./api/serviceApi').then(m => m.serviceApi.updateService(id, service)),
  deleteService: (id: string) => import('./api/serviceApi').then(m => m.serviceApi.deleteService(id)),
  getServiceCategories: () => import('./api/serviceApi').then(m => m.serviceApi.getCategories()),

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
  getStaffAvailability: (staffId?: string, date?: string, startDate?: string, endDate?: string, page?: number, pageSize?: number) => 
    import('./api/staffAvailabilityApi').then(m => m.staffAvailabilityApi.getStaffAvailability(staffId, date, startDate, endDate, page, pageSize)),
  getAvailabilityById: (id: string) => import('./api/staffAvailabilityApi').then(m => m.staffAvailabilityApi.getAvailabilityById(id)),
  getAvailabilityRange: (staffId: string, startDate: string, endDate: string) => 
    import('./api/staffAvailabilityApi').then(m => m.staffAvailabilityApi.getAvailabilityRange(staffId, startDate, endDate)),
  checkAvailability: (staffId: string, date: string, startTime?: string, endTime?: string) => 
    import('./api/staffAvailabilityApi').then(m => m.staffAvailabilityApi.checkAvailability(staffId, date, startTime, endTime)),
  createStaffAvailability: (availability: any) => import('./api/staffAvailabilityApi').then(m => m.staffAvailabilityApi.createStaffAvailability(availability)),
  updateStaffAvailability: (id: string, availability: any) => import('./api/staffAvailabilityApi').then(m => m.staffAvailabilityApi.updateStaffAvailability(id, availability)),
  deleteStaffAvailability: (id: string) => import('./api/staffAvailabilityApi').then(m => m.staffAvailabilityApi.deleteStaffAvailability(id)),
  bulkCreateAvailability: (records: any[]) => import('./api/staffAvailabilityApi').then(m => m.staffAvailabilityApi.bulkCreateAvailability(records)),

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
  exportReport: (type: 'revenue' | 'services' | 'staff' | 'clients') => import('./api/reportsApi').then(m => m.reportsApi.exportReport(type)),

  // Product Sales functions
  createProductSale: (saleData: any) => import('./api/productSalesApi').then(m => m.productSalesApi.createSale(saleData)),
  getProductSales: (startDate?: string, endDate?: string, page?: number, pageSize?: number) =>
    import('./api/productSalesApi').then(m => m.productSalesApi.getSales(startDate, endDate, page, pageSize)),
  getTodaysProductSales: () => import('./api/productSalesApi').then(m => m.productSalesApi.getTodaysSales()),
  getProductSalesStats: (startDate?: string, endDate?: string) =>
    import('./api/productSalesApi').then(m => m.productSalesApi.getSalesStats(startDate, endDate)),

  // Enhanced Inventory functions with sales
  getInventoryItems: (category?: string, lowStock?: boolean) => 
    import('./api/inventoryApi').then(m => m.inventoryApi.getItems(category, lowStock)),
  getInventoryItem: (id: string) => import('./api/inventoryApi').then(m => m.inventoryApi.getItem(id)),
  createInventoryItem: (item: any) => import('./api/inventoryApi').then(m => m.inventoryApi.createItem(item)),
  updateInventoryItem: (id: string, updates: any) => import('./api/inventoryApi').then(m => m.inventoryApi.updateItem(id, updates)),
  deleteInventoryItem: (id: string) => import('./api/inventoryApi').then(m => m.inventoryApi.deleteItem(id)),
  updateInventoryStock: (id: string, quantity: number, operation: 'add' | 'subtract' | 'set') =>
    import('./api/inventoryApi').then(m => m.inventoryApi.updateStock(id, quantity, operation)),
  getInventoryCategories: () => import('./api/inventoryApi').then(m => m.inventoryApi.getCategories()),
  getLowStockItems: () => import('./api/inventoryApi').then(m => m.inventoryApi.getLowStockItems()),

  // Enhanced Finance functions
  getFinancialTransactions: (startDate?: string, endDate?: string, type?: 'income' | 'expense', category?: string, page?: number, pageSize?: number) =>
    import('./api/financeApi').then(m => m.financeApi.getTransactions(startDate, endDate, type, category, page, pageSize)),
  createFinancialTransaction: (transaction: any) => import('./api/financeApi').then(m => m.financeApi.createTransaction(transaction)),
  updateFinancialTransaction: (id: string, updates: any) => import('./api/financeApi').then(m => m.financeApi.updateTransaction(id, updates)),
  deleteFinancialTransaction: (id: string) => import('./api/financeApi').then(m => m.financeApi.deleteTransaction(id)),
  getFinancialSummary: (startDate?: string, endDate?: string) => 
    import('./api/financeApi').then(m => m.financeApi.getFinancialSummary(startDate, endDate)),
  getCategorySummary: (type: 'income' | 'expense', startDate?: string, endDate?: string) =>
    import('./api/financeApi').then(m => m.financeApi.getCategorySummary(type, startDate, endDate)),

  // Enhanced appointment functions
  getAppointmentServices: (appointmentId: string) => 
    import('./api/enhancedAppointmentApi').then(m => m.enhancedAppointmentApi.getAppointmentServices(appointmentId)),
  addServiceToAppointment: (appointmentId: string, service: any) =>
    import('./api/enhancedAppointmentApi').then(m => m.enhancedAppointmentApi.addServiceToAppointment(appointmentId, service)),
  removeServiceFromAppointment: (serviceId: string) =>
    import('./api/enhancedAppointmentApi').then(m => m.enhancedAppointmentApi.removeServiceFromAppointment(serviceId)),
  getAppointmentWithServices: (appointmentId: string) =>
    import('./api/enhancedAppointmentApi').then(m => m.enhancedAppointmentApi.getAppointmentWithServices(appointmentId)),
  createMultiServiceAppointment: (appointmentData: any, services: any[]) =>
    import('./api/enhancedAppointmentApi').then(m => m.enhancedAppointmentApi.createMultiServiceAppointment(appointmentData, services)),

  // Receipt functions
  getReceiptTemplates: () => import('./api/receiptApi').then(m => m.receiptApi.getTemplates()),
  getDefaultReceiptTemplate: () => import('./api/receiptApi').then(m => m.receiptApi.getDefaultTemplate()),
  createReceiptTemplate: (template: any) => import('./api/receiptApi').then(m => m.receiptApi.createTemplate(template)),
  updateReceiptTemplate: (id: string, updates: any) => import('./api/receiptApi').then(m => m.receiptApi.updateTemplate(id, updates)),
  deleteReceiptTemplate: (id: string) => import('./api/receiptApi').then(m => m.receiptApi.deleteTemplate(id)),
  generateReceiptData: (appointmentId: string, templateId?: string) =>
    import('./api/receiptApi').then(m => m.receiptApi.generateReceiptData(appointmentId, templateId))
};
