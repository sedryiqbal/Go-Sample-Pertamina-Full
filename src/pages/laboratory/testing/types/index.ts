export interface TestingRecord {
  id: number | string;
  orderNo?: string;
  tanggalOrder?: string;
  nomorNpc?: string;
  categoryTestName?: string;
  categoryTestId?: number | string;
  etaArival?: string;
  status?: number;
  priority?: 'normal' | 'urgent' | 'critical' | string;
  notes?: string;
  pathPhotoSample?: string;
  pathMemo?: string;
  createdAt?: string;

  // Legacy/optional fields used by other UI components
  sample_id?: string;
  order_number?: string;
  sample_type?: string;
  vessel_name?: string;
  tank_number?: string;
  received_date?: string;
  testing_status?:
    | 'received'
    | 'registered'
    | 'testing'
    | 'waiting_equipment'
    | 'completed'
    | 'failed'
    | 'pending'
    | 'shipped'
    | 'proses'
    | string;
  lab_technician?: string;
  equipment_used?: string;
  test_parameters?: string[];
  test_results?: { [key: string]: any };
  progress_percentage?: number;
  estimated_completion?: string;
  actual_completion?: string;
  quality_notes?: string;
  created_at?: string;
  updated_at?: string;
  sample?: {
    id?: number;
    shipName?: string;
    typeLoadName?: string;
    nomorTanki?: string | number;
    qty?: number;
    satuanName?: string;
    status?: string;
  };
  receivedAt?: string;
  receivedBy?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  confirmedReason?: string;
  registeredAt?: string;
  registeredBy?: string;
  registeredReason?: string;
  testedAt?: string;
  testedBy?: string;
  completedAt?: string;
  completedBy?: string;
  completedReason?: string;
  canceledAt?: string;
  canceledBy?: string;
  canceledReason?: string;
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
