
export interface StaffPerformance {
  id: string;
  staff_id: string;
  month: string;
  total_clients: number;
  new_clients: number;
  regular_clients: number;
  total_revenue: number;
  appointments_completed: number;
  staff_name: string;
}

export interface ClientCategorization {
  staff_id: string;
  staff_name: string;
  total_clients: number;
  new_clients: number;
  regular_clients: number;
}
