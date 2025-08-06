export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'sample-officer' | 'supervisor' | 'head' | 'lab-staff';
  department: 'pertamina' | 'laboratory';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Stock {
  id: string;
  productType: 'jet-a1' | 'avgas' | 'diesel';
  category: string;
  shipName: string;
  compartment: string;
  quantity: number;
  unit: string;
  estimatedDate: string;
  status: 'available' | 'limited' | 'empty';
  createdAt: string;
}

export interface SampleOrder {
  id: string;
  orderNumber: string;
  orderType: 'stock' | 'request';
  productType: string;
  shipName: string;
  tankNumber?: string;
  quantity: number;
  unit: string;
  laboratory: string;
  estimatedTime: string;
  priority: 'normal' | 'urgent' | 'critical';
  status: 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  id: string;
  sampleCode: string;
  productType: string;
  shipName: string;
  laboratory: string;
  receivedDate: string;
  testStatus: 'received' | 'testing' | 'completed' | 'failed';
  testProgress: number;
  testResults?: {
    density?: number;
    viscosity?: number;
    waterContent?: number;
    flashPoint?: number;
  };
  currentEquipment?: string;
  estimatedCompletion?: string;
}

export interface ComparisonResult {
  id: string;
  sampleCode: string;
  productType: string;
  testResults: {
    density: number;
    viscosity: number;
    waterContent: number;
    flashPoint: number;
  };
  standards: {
    density: { min: number; max: number };
    viscosity: { min: number; max: number };
    waterContent: { max: number };
    flashPoint: { min: number };
  };
  comparisonStatus: 'on-spec' | 'off-spec';
  finalStatus: 'release' | 'repeat';
  createdAt: string;
}

export interface StockOpname {
  id: string;
  sampleCode: string;
  productType: string;
  laboratory: string;
  currentStock: number;
  usedQuantity: number;
  remainingQuantity: number;
  status: 'available' | 'used' | 'damaged' | 'returned';
  lastUpdated: string;
}
