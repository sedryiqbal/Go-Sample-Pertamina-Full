import { request } from '@umijs/max';
import type {
  ApiResponse,
  ComparisonResult,
  ComparisonSampleOrder,
  ComparisonSampleOrderParams,
  ComparisonSummary,
  ExistingComparisonData,
  PaginatedApiResponse,
  ProcessComparisonRequest,
  PropertyTest,
  SampleOrderDetail,
  SaveComparisonsRequest,
} from './typings';

const COMPARISON_ENDPOINT = '/api/LabComparison';
const COMPARISON_RESULT_ENDPOINT = '/api/LabComparisonResult';
const PROPERTY_TESTS_ENDPOINT = '/api/PropertyTests';

/**
 * Fetch comparison summary statistics
 * GET /api/LabComparison/summary
 */
export const fetchComparisonSummary = async (): Promise<ComparisonSummary> => {
  const response = await request<ApiResponse<ComparisonSummary>>(
    `${COMPARISON_ENDPOINT}/summary`,
    {
      method: 'GET',
    },
  );

  return response?.data ?? {
    totalRecords: 0,
    ready: 0,
    inProgress: 0,
    completed: 0,
  };
};

/**
 * Fetch sample orders for comparison
 * GET /api/LabComparison/sample-orders
 */
export const fetchComparisonSampleOrders = async (
  params?: ComparisonSampleOrderParams,
): Promise<PaginatedApiResponse<ComparisonSampleOrder>> => {
  const response = await request<PaginatedApiResponse<ComparisonSampleOrder>>(
    `${COMPARISON_ENDPOINT}/sample-orders`,
    {
      method: 'GET',
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
        search: params?.search,
        startDate: params?.startDate,
        endDate: params?.endDate,
      },
    },
  );

  return response;
};

/**
 * Fetch property tests by sample order ID
 * GET /api/PropertyTests/by-sample-order/:sampleOrderId
 */
export const fetchPropertyTestsBySampleOrder = async (
  sampleOrderId: number,
): Promise<PropertyTest[]> => {
  const response = await request<ApiResponse<PropertyTest[]>>(
    `${PROPERTY_TESTS_ENDPOINT}/by-sample-order/${sampleOrderId}`,
    {
      method: 'GET',
    },
  );

  return response?.data ?? [];
};

/**
 * Fetch sample order detail by ID
 * GET /api/LabComparison/sample-orders/:sampleOrderId
 */
export const fetchSampleOrderDetail = async (
  sampleOrderId: number,
): Promise<SampleOrderDetail | null> => {
  const response = await request<ApiResponse<SampleOrderDetail>>(
    `${COMPARISON_ENDPOINT}/sample-orders/${sampleOrderId}`,
    {
      method: 'GET',
    },
  );

  return response?.data ?? null;
};

/**
 * Save comparisons data
 * POST /api/LabComparison/comparisons
 */
export const saveComparisons = async (
  data: SaveComparisonsRequest,
): Promise<ApiResponse<any>> => {
  const response = await request<ApiResponse<any>>(
    `${COMPARISON_ENDPOINT}/comparisons`,
    {
      method: 'POST',
      data,
    },
  );

  return response;
};

/**
 * Fetch existing comparisons by sample order ID
 * GET /api/LabComparison/comparisons/by-sample-order/:sampleOrderId
 */
export const fetchExistingComparisons = async (
  sampleOrderId: number,
): Promise<ExistingComparisonData[]> => {
  const response = await request<ApiResponse<ExistingComparisonData[]>>(
    `${COMPARISON_ENDPOINT}/comparisons/by-sample-order/${sampleOrderId}`,
    {
      method: 'GET',
    },
  );

  return response?.data ?? [];
};

/**
 * Process/Generate comparison result
 * POST /api/LabComparisonResult/process
 */
export const processComparisonResult = async (
  data: ProcessComparisonRequest,
): Promise<ApiResponse<any>> => {
  const response = await request<ApiResponse<any>>(
    `${COMPARISON_RESULT_ENDPOINT}/process`,
    {
      method: 'POST',
      data,
    },
  );

  return response;
};

/**
 * Fetch comparison result by sample order ID
 * GET /api/LabComparisonResult/sample-order/:sampleOrderId
 */
export const fetchComparisonResult = async (
  sampleOrderId: number,
): Promise<ComparisonResult | null> => {
  const response = await request<ApiResponse<ComparisonResult>>(
    `${COMPARISON_RESULT_ENDPOINT}/sample-order/${sampleOrderId}`,
    {
      method: 'GET',
    },
  );

  return response?.data ?? null;
};
