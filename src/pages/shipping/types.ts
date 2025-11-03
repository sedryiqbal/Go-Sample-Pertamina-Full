export type OrderPriority = 'normal' | 'urgent';
export type OrderType = 'ready' | 'request' | 'sample';
export type OrderStatus = 'completed' | 'cancelled';
export type ProgressStatus = 'pickup' | 'in_transit' | 'delivered';

export interface StatusUpdate {
  id: string;
  timestamp: string;
  message: string;
  created_by: string;
}

export interface PendingSampleOrder {
  id: string;
  order_number: string;
  npc_number: string;
  order_type: OrderType;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  quantity: number;
  unit: string;
  pickup_location: string;
  delivery_location: string;
  estimated_arrival_time: string | null;
  notes?: string | null;
  priority: OrderPriority;
  created_at: string;
}

export interface ShippingHistory {
  id: string;
  order_number: string;
  npc_number: string;
  sample_type: string;
  pickup_location: string;
  delivery_location: string;
  pickup_time: string;
  delivery_time: string;
  status: OrderStatus;
  distance: string;
  vessel_name?: string;
  tank_number?: string;
  quantity?: number;
  unit?: string;
  status_updates?: StatusUpdate[];
}

export interface ProgressOrder {
  id: string;
  order_number: string;
  npc_number: string;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  quantity: number;
  unit: string;
  pickup_location: string;
  delivery_location: string;
  pickup_time: string;
  estimated_delivery_time: string;
  distance: string;
  current_status: ProgressStatus;
  progress_percentage: number;
  status_updates: StatusUpdate[];
}

export interface ShippingSummary {
  pending: number;
  inProgress: number;
  todayCompleted: number;
  totalDeliveries: number;
  successRate: number;
}
