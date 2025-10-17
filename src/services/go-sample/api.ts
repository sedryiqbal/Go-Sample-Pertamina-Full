import { request } from '@umijs/max';
import { buildGoSampleApiPath } from '@/config/api';
import type {
  ApiResponse,
  User,
  Stock,
  SampleOrder,
  TestResult,
  ComparisonResult,
  StockOpname
} from './typings';

const apiPath = (path: string) => buildGoSampleApiPath(path);

// User Management APIs
export async function getUsers(params?: any): Promise<ApiResponse<User[]>> {
  return request(apiPath('users'), {
    method: 'GET',
    params,
  });
}

export async function createUser(data: Partial<User>): Promise<ApiResponse<User>> {
  return request(apiPath('users'), {
    method: 'POST',
    data,
  });
}

export async function updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
  return request(apiPath(`users/${id}`), {
    method: 'PUT',
    data,
  });
}

export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  return request(apiPath(`users/${id}`), {
    method: 'DELETE',
  });
}

// Stock Management APIs
export async function getStocks(params?: any): Promise<ApiResponse<Stock[]>> {
  return request(apiPath('stocks'), {
    method: 'GET',
    params,
  });
}

export async function createStock(data: Partial<Stock>): Promise<ApiResponse<Stock>> {
  return request(apiPath('stocks'), {
    method: 'POST',
    data,
  });
}

export async function updateStock(id: string, data: Partial<Stock>): Promise<ApiResponse<Stock>> {
  return request(apiPath(`stocks/${id}`), {
    method: 'PUT',
    data,
  });
}

export async function deleteStock(id: string): Promise<ApiResponse<void>> {
  return request(apiPath(`stocks/${id}`), {
    method: 'DELETE',
  });
}

// Sample Order APIs
export async function getSampleOrders(params?: any): Promise<ApiResponse<SampleOrder[]>> {
  return request(apiPath('sample-orders'), {
    method: 'GET',
    params,
  });
}

export async function createSampleOrder(data: Partial<SampleOrder>): Promise<ApiResponse<SampleOrder>> {
  return request(apiPath('sample-orders'), {
    method: 'POST',
    data,
  });
}

export async function updateSampleOrder(id: string, data: Partial<SampleOrder>): Promise<ApiResponse<SampleOrder>> {
  return request(apiPath(`sample-orders/${id}`), {
    method: 'PUT',
    data,
  });
}

export async function deleteSampleOrder(id: string): Promise<ApiResponse<void>> {
  return request(apiPath(`sample-orders/${id}`), {
    method: 'DELETE',
  });
}

// Laboratory Testing APIs
export async function getTestResults(params?: any): Promise<ApiResponse<TestResult[]>> {
  return request(apiPath('test-results'), {
    method: 'GET',
    params,
  });
}

export async function updateTestResult(id: string, data: Partial<TestResult>): Promise<ApiResponse<TestResult>> {
  return request(apiPath(`test-results/${id}`), {
    method: 'PUT',
    data,
  });
}

export async function startTesting(id: string, data: { equipment: string }): Promise<ApiResponse<TestResult>> {
  return request(apiPath(`test-results/${id}/start`), {
    method: 'POST',
    data,
  });
}

// Comparison APIs
export async function getComparisonResults(params?: any): Promise<ApiResponse<ComparisonResult[]>> {
  return request(apiPath('comparisons'), {
    method: 'GET',
    params,
  });
}

export async function createComparison(data: Partial<ComparisonResult>): Promise<ApiResponse<ComparisonResult>> {
  return request(apiPath('comparisons'), {
    method: 'POST',
    data,
  });
}

export async function generateQualityCheckPDF(id: string): Promise<Blob> {
  return request(apiPath(`comparisons/${id}/quality-check-pdf`), {
    method: 'GET',
    responseType: 'blob',
  });
}

// Stock Opname APIs
export async function getStockOpnames(params?: any): Promise<ApiResponse<StockOpname[]>> {
  return request(apiPath('stock-opnames'), {
    method: 'GET',
    params,
  });
}

export async function updateStockOpname(id: string, data: Partial<StockOpname>): Promise<ApiResponse<StockOpname>> {
  return request(apiPath(`stock-opnames/${id}`), {
    method: 'PUT',
    data,
  });
}

// Dashboard APIs
export async function getDashboardStats(): Promise<ApiResponse<{
  totalTests: number;
  completedTests: number;
  processingTests: number;
  successRate: number;
  weeklyStats: Array<{ date: string; success: number; failed: number }>;
}>> {
  return request(apiPath('dashboard/stats'), {
    method: 'GET',
  });
}

export async function getCalendarData(params: { startDate: string; endDate: string }): Promise<ApiResponse<{
  [date: string]: Array<{ type: 'success' | 'warning' | 'error'; content: string }>;
}>> {
  return request(apiPath('dashboard/calendar'), {
    method: 'GET',
    params,
  });
}

// Monitoring APIs
export async function getRealtimeStatus(): Promise<ApiResponse<{
  samples: Array<{
    id: string;
    code: string;
    status: string;
    location: string;
    estimatedArrival?: string;
    issues?: string[];
  }>;
}>> {
  return request(apiPath('monitoring/realtime'), {
    method: 'GET',
  });
}

// Reports APIs
export async function generateReport(params: {
  type: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  format: 'pdf' | 'excel';
}): Promise<Blob> {
  return request(apiPath('reports/generate'), {
    method: 'POST',
    data: params,
    responseType: 'blob',
  });
}
