import { request } from '@umijs/max';

const PRODUCT_QC_ENDPOINT = '/api/ProductQC';
const PRODUCT_QC_BY_SHIP_ENDPOINT = `${PRODUCT_QC_ENDPOINT}/ship`;
const PRODUCT_QC_CALCULATE_DENSITY_ENDPOINT = `${PRODUCT_QC_ENDPOINT}/calculate-density`;

export interface ProductQcCompartmentRecord {
  id: number;
  type: number;
  freeWater: number;
  suspendedWater: number;
  electricalConductivity: number;
  temperatureObserved: number;
  densityObserved: number;
  densityAt15C: number;
  batchDensity: number;
  diff: number;
  notes?: string | null;
}

export interface ProductQcCertificateRecord {
  id: number;
  shipID: number;
  no: string;
  date: string;
}

export interface ProductQcRecord {
  id: number;
  shipID: number;
  shipName: string;
  arrivalDate: string;
  quantityInBatch: number;
  voyageNo: string;
  refineryTerminal: string;
  gradeOfProduct: string;
  compartmentData: ProductQcCompartmentRecord[];
  rCoQs: ProductQcCertificateRecord[];
  createdAt: string;
}

interface ProductQcEnvelope {
  code?: string;
  status?: boolean;
  message?: string;
  data?: ProductQcRecord[];
  timestamp?: string;
}

export const fetchProductQcByShip = async (
  shipId: string | number,
): Promise<ProductQcRecord[]> => {
  if (shipId === undefined || shipId === null || shipId === '') {
    throw new Error('Ship ID is required to fetch Product QC data');
  }

  const response = await request<ProductQcEnvelope>(
    `${PRODUCT_QC_BY_SHIP_ENDPOINT}/${shipId}`,
    {
      method: 'GET',
    },
  );

  if (!response) {
    return [];
  }

  if (response.status === false) {
    const errorMessage =
      typeof response.message === 'string' && response.message.trim()
        ? response.message
        : 'Failed to load Product QC data';
    throw new Error(errorMessage);
  }

  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data;
};

export interface CalculateDensityPayload {
  temperatureObserved: number;
  densityObserved: number;
}

interface CalculateDensityEnvelope {
  code?: string;
  status?: boolean;
  message?: string;
  data?: {
    temperatureObserved?: number;
    densityObserved?: number;
    densityAt15C?: number;
    message?: string;
  };
  timestamp?: string;
}

export const calculateDensityAt15C = async (
  payload: CalculateDensityPayload,
): Promise<number> => {
  try {
    const response = await request<CalculateDensityEnvelope>(
      PRODUCT_QC_CALCULATE_DENSITY_ENDPOINT,
      {
        method: 'POST',
        data: payload,
        skipErrorHandler: true,
      },
    );

    if (!response?.status) {
      const errorMessage =
        typeof response?.message === 'string' && response.message.trim()
          ? response.message
          : 'Failed to calculate density @15°C';
      throw new Error(errorMessage);
    }

    const density = response.data?.densityAt15C;

    if (typeof density !== 'number') {
      throw new Error('API tidak mengembalikan nilai Density @15°C');
    }

    return density;
  } catch (error: any) {
    const errorMessage =
      error?.data?.message ??
      error?.response?.data?.message ??
      error?.message ??
      'Failed to calculate density @15°C';
    throw new Error(errorMessage);
  }
};

export interface CreateProductQcCompartmentPayload {
  type: number;
  freeWater: number;
  suspendedWater: number;
  electricalConductivity: number;
  temperatureObserved: number;
  densityObserved: number;
  densityAt15C?: number;
  batchDensity: number;
  diff: number;
  notes?: string | null;
}

export interface CreateProductQcCertificatePayload {
  no: string;
  date: string;
}

export interface CreateProductQcPayload {
  shipID: number;
  arrivalDate: string;
  quantityInBatch: number;
  refineryTerminal: string;
  gradeOfProduct: string;
  compartmentData: CreateProductQcCompartmentPayload[];
  rCoQs: CreateProductQcCertificatePayload[];
}

interface ProductQcCreateEnvelope {
  code?: string;
  status?: boolean;
  message?: string;
  data?: ProductQcRecord;
  timestamp?: string;
}

export const createProductQc = async (
  payload: CreateProductQcPayload,
): Promise<ProductQcRecord | null> => {
  try {
    const response = await request<ProductQcCreateEnvelope | ProductQcRecord>(
      PRODUCT_QC_ENDPOINT,
      {
        method: 'POST',
        data: payload,
        skipErrorHandler: true,
      },
    );

    if (response && typeof response === 'object' && 'status' in response) {
      const envelope = response as ProductQcCreateEnvelope;
      if (envelope.status === false) {
        const errorMessage =
          typeof envelope.message === 'string' && envelope.message.trim()
            ? envelope.message
            : 'Gagal membuat Product QC';
        throw new Error(errorMessage);
      }

      return envelope.data ?? null;
    }

    return (response as ProductQcRecord) ?? null;
  } catch (error: any) {
    const errorMessage =
      error?.data?.message ??
      error?.response?.data?.message ??
      error?.message ??
      'Gagal membuat Product QC';
    throw new Error(errorMessage);
  }
};

export const deleteProductQc = async (
  productQcId: number | string,
): Promise<void> => {
  if (productQcId === null || productQcId === undefined || productQcId === '') {
    throw new Error('Product QC ID is required');
  }

  try {
    await request<void>(`${PRODUCT_QC_ENDPOINT}/${productQcId}`, {
      method: 'DELETE',
      skipErrorHandler: true,
    });
  } catch (error: any) {
    const errorMessage =
      error?.data?.message ??
      error?.response?.data?.message ??
      error?.message ??
      'Gagal menghapus Product QC';
    throw new Error(errorMessage);
  }
};
