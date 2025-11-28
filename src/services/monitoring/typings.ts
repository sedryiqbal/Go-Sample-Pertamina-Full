// API Response wrapper
export interface MonitoringApiEnvelope<T> {
  code: string;
  status: boolean;
  message: string;
  data: T;
  meta?: {
    pagination?: MonitoringPagination;
  };
  timestamp: string;
}

// Pagination
export interface MonitoringPagination {
  page: number;
  perPage: number;
  totalData: number;
  totalPage: number;
}

// Count Cards Response
export interface MonitoringCountCards {
  totalSamples: number;
  samplesInTransit: number;
  samplesInLab: number;
  samplesCompleted: number;
}

// Sample Order List Item
export interface MonitoringSampleOrder {
  id: number;
  orderNo: string;
  sampleType: string;
  status: string;
  statusValue: number;
  progress: number;
  lastUpdated: string;
}

// Sample Order List Query
export interface MonitoringSampleOrderQuery {
  Status?: string;
  ShipId?: number;
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  SortDescending?: boolean;
}

// Sample Order Detail
export interface MonitoringSampleOrderDetail {
  id: number;
  information: {
    currentStatus: string;
    statusValue: number;
    progress: number;
    lastUpdated: string;
    lastUpdatedFormatted: string;
  };
  timeline: MonitoringTimelineEvent[];
  sampleInfo: {
    orderNumber: string;
    sampleType: string;
    vesselTank: string;
    quantity: string;
    category: string;
    priority: string;
    nomorNpc: string;
    tanggalOrder: string;
    etaArival: string;
    notes: string;
  };
  contactInfo: {
    labInfo: {
      id: number;
      name: string;
      description: string;
    };
    driverInfo: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export interface MonitoringTimelineEvent {
  oldStatus: string;
  newStatus: string;
  time: string;
  timeValue: string;
  userName: string;
  comment?: string;
}

// Status enum for filtering
export enum MonitoringStatus {
  Pending = 0,
  WaitingPickupSample = 1,
  InTransit = 2,
  Delivered = 3,
  ConfirmSampleInLab = 4,
  RegisteredLabSample = 5,
  StartTesting = 6,
  CompletedTesting = 7,
  Comparation = 8,
  CompletedComparation = 9,
  Canceled = 10,
}

// Status label mapping
export const MonitoringStatusLabels: Record<number, string> = {
  [MonitoringStatus.Pending]: 'Pending',
  [MonitoringStatus.WaitingPickupSample]: 'Menunggu Pickup',
  [MonitoringStatus.InTransit]: 'Dalam Perjalanan',
  [MonitoringStatus.Delivered]: 'Terkirim',
  [MonitoringStatus.ConfirmSampleInLab]: 'Sampel Diterima Lab',
  [MonitoringStatus.RegisteredLabSample]: 'Terdaftar di Lab',
  [MonitoringStatus.StartTesting]: 'Pengujian Dimulai',
  [MonitoringStatus.CompletedTesting]: 'Pengujian Selesai',
  [MonitoringStatus.Comparation]: 'Perbandingan',
  [MonitoringStatus.CompletedComparation]: 'Perbandingan Selesai',
  [MonitoringStatus.Canceled]: 'Dibatalkan',
};
