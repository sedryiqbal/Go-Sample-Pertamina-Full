import type { SampleOrderApiRecord } from '@/services/sample-estimations/typings';

export type OrderType = 'ready' | 'request';

export type OrderPriority = 'normal' | 'urgent';

export type OrderStatus =
  | 'pending'
  | 'waiting_pickup_sample'
  | 'in_transit'
  | 'delivered'
  | 'confirm_sample_in_lab'
  | 'registered_lab_sample'
  | 'start_testing'
  | 'completed_testing'
  | 'comparation'
  | 'completed_comparation'
  | 'cancelled'
  | 'confirmed'
  | 'picked_up';

export type SampleStatus =
  | 'available'
  | 'low'
  | 'urgent'
  | 'reserved'
  | 'pending'
  | 'unavailable';

export interface SampleOrderRecord {
  id: string;
  order_number: string;
  order_type: OrderType;
  order_date: string;
  npc_number: string;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  quantity: number;
  unit: string;
  lab_location: string;
  category_test: string;
  estimated_delivery_time: number;
  priority: OrderPriority;
  status: OrderStatus;
  category?: 'import' | 'local' | 'reference';
  company_sender?: string;
  sender_name?: string;
  sender_phone?: string;
  estimated_arrival?: string;
  photo_sample?: string;
  memo_file?: string;
  notes?: string;
  created_at: string;
  selected_sample_id?: string;
  sample_estimation_id?: number | null;
  sample_type_id?: number | null;
  lab_id?: number | null;
  category_test_id?: number | null;
  ship_id?: number | null;
  tank_id?: number | null;
  unit_id?: number | null;
  order_status_code?: number | null;
  status_label?: string;
  raw?: SampleOrderApiRecord;
}

export interface AvailableSample {
  id: string;
  sample_type: string;
  sampleTypeId?: number | null;
  vessel_name: string;
  shipId?: number | null;
  tank_number: string;
  tankId?: number | null;
  quantity: number;
  available_quantity?: number | null;
  unit: string;
  unitId?: number | null;
  location: string;
  status: SampleStatus;
  received_date?: string;
  detailSample?: string | null;
  raw?: Record<string, unknown>;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  meta?: Record<string, unknown>;
}

export interface SummaryMetrics {
  total: number;
  ready: number;
  request: number;
  pending: number;
  in_progress: number;
  delivered: number;
}
