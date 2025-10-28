export type OrderType = 'ready' | 'request';

export type OrderPriority = 'normal' | 'urgent';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

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
