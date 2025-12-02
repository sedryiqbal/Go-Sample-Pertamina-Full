// API Response types
export interface ApiResponse<T> {
  code: string;
  status: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedApiResponse<T> {
  code: string;
  status: boolean;
  message: string;
  data: T[];
  meta: {
    pagination: {
      page: number;
      perPage: number;
      totalData: number;
      totalPage: number;
    };
  };
  timestamp: string;
}

// Summary types
export interface ComparisonSummary {
  totalRecords: number;
  ready: number;
  inProgress: number;
  completed: number;
}

// Sample Order types for comparison list
export interface ComparisonSampleOrderWorkflow {
  labTester: boolean;
  averageCoq: boolean;
  comparationTest: boolean;
}

export interface ComparisonSampleOrder {
  id: number;
  orderNo: string;
  nomorNpc: string;
  tanggalOrder: string;
  labName: string;
  categoryTestName: string;
  typeLoadName: string;
  shipName?: string;
  nomorTangki: number;
  tankiName: string;
  quantity: number;
  satuanName: string;
  priority: 'normal' | 'urgent' | 'critical';
  workflow: ComparisonSampleOrderWorkflow;
  status: string | number;
  createdAt: string;
  updatedAt: string;
  releaseStatusId?: number | null;
  releaseStatusName?: string | null;
  releaseNotes?: string | null;
  releaseDate?: string | null;
}

// Query params for fetching sample orders
export interface ComparisonSampleOrderParams {
  page?: number;
  pageSize?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Property Test types
export interface PropertyTest {
  id: number;
  categoryId: number;
  categoryName: string;
  order: number;
  title: string;
  description: string;
  createdAt: string;
  createdBy?: string;
}

// Sample Order Detail types
export interface SampleOrderDetail {
  sampleId: number;
  orderId: number;
  orderNo: string;
  sampleType: string;
  vessel: string;
  nomorNpc?: string;
  tanggalOrder?: string;
  typeLoadName?: string;
  shipName?: string;
}

// COQ Comparison types for saving
export interface TankData {
  noTanki: string;
  coq: number;
}

export interface ComparisonItem {
  propertyTestId: number;
  tankData: TankData[];
}

export interface SaveComparisonsRequest {
  sampleOrderId: number;
  comparisons: ComparisonItem[];
  documentCompartion?: string;
}

export interface AdditionalComparisonData {
  id: number;
  sampleOrderId: number;
  orderNo: string;
  noCompartionTest?: string;
  documentCompartion?: string;
  createdAt?: string;
}

// Existing comparison data from API
export interface ExistingComparisonData {
  id: number;
  sampleOrderId: number;
  orderNo: string;
  propertyTestId: number;
  propertyTestTitle: string;
  labId: number;
  labName: string;
  avgCoq: number;
  tankData: TankData[];
  createdBy: string;
  createdAt: string;
}

// Comparison result types
export interface ComparisonResultItem {
  id: number;
  propertyTestId: number;
  propertyName: string;
  avgCoq: number;
  labTestingCoq: number;
  difference: number;
  isOnSpecification: boolean;
  createdAt: string;
}

export interface ComparisonResult {
  id: number;
  sampleOrderId: number;
  orderNo: string;
  sampleId: string;
  sampleType: string;
  vesselName: string;
  labId: number;
  labName: string;
  totalParameters: number;
  onSpecification: number;
  offSpecification: number;
  results: ComparisonResultItem[];
  createdAt: string;
  createdBy: string;
}

export interface ProcessComparisonRequest {
  sampleOrderId: number;
}
