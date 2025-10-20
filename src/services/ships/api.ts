import { request } from '@umijs/max';
import type {
  CreateShipPayload,
  Ship,
  ShipApiEnvelope,
  ShipListEnvelope,
  ShipListQuery,
} from './typings';

const SHIPS_ENDPOINT = '/api/ships';

const unwrapResponse = <T>(response: ShipApiEnvelope<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    const envelope = response as ShipApiEnvelope<T>;
    if (!('data' in envelope) || envelope.data === undefined) {
      const errorMessage =
        typeof envelope.message === 'string' && envelope.message.trim()
          ? envelope.message
          : 'Response payload does not include data';
      throw new Error(errorMessage);
    }
    return envelope.data;
  }

  return response as T;
};

export const createShip = async (payload: CreateShipPayload): Promise<Ship> => {
  const response = await request<ShipApiEnvelope<Ship> | Ship>(SHIPS_ENDPOINT, {
    method: 'POST',
    data: payload,
  });

  return unwrapResponse<Ship>(response);
};

export const updateShip = async (
  shipId: string,
  payload: CreateShipPayload,
): Promise<Ship> => {
  if (!shipId) {
    throw new Error('Ship ID is required');
  }

  const response = await request<ShipApiEnvelope<Ship> | Ship>(
    `${SHIPS_ENDPOINT}/${shipId}`,
    {
      method: 'PUT',
      data: payload,
    },
  );

  return unwrapResponse<Ship>(response);
};

export const deleteShip = async (shipId: string): Promise<void> => {
  if (!shipId) {
    throw new Error('Ship ID is required');
  }

  await request<void>(`${SHIPS_ENDPOINT}/${shipId}`, {
    method: 'DELETE',
  });
};

export const fetchShips = async (
  params?: ShipListQuery,
): Promise<ShipListEnvelope> => {
  const response = await request<
    ShipApiEnvelope<ShipListEnvelope> | ShipListEnvelope
  >(SHIPS_ENDPOINT, {
    method: 'GET',
    params,
  });

  return unwrapResponse<ShipListEnvelope>(response);
};
