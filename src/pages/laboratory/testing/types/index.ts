export interface TestingRecord {
  id: string;
  sample_id: string;
  order_number: string;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  received_date: string;
  testing_status:
    | 'received'
    | 'registered'
    | 'testing'
    | 'waiting_equipment'
    | 'completed'
    | 'failed'
    | 'pending'
    | 'shipped'
    | 'proses';
  lab_technician: string;
  equipment_used?: string;
  test_parameters: string[];
  test_results: { [key: string]: any };
  progress_percentage: number;
  priority: 'normal' | 'urgent' | 'critical';
  estimated_completion: string;
  actual_completion?: string;
  quality_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface SyringeData {
  id: string;
  location: string;
  current_stock: number;
  min_threshold: number;
  max_capacity: number;
  last_updated: string;
  status: 'normal' | 'low' | 'urgent' | 'full';
}

export interface TestResult {
  value: number;
  unit: string;
  status: 'pass' | 'fail' | 'unknown';
  limit?: string;
  method?: string;
}
