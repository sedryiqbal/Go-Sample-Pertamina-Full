import { message } from 'antd';
import { useCallback, useMemo, useRef, useState } from 'react';
import { createShip as createShipApi, fetchShips } from '@/services/ships/api';
import type { Ship, ShipListQuery } from '@/services/ships/typings';
import type { ShipFormValues } from '../types';
import { deriveShipSummary, toCreateShipPayload } from '../utils';

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const source = error as Record<string, any>;
  const candidates = [
    source?.data?.data?.message,
    source?.data?.message,
    source?.response?.data?.data?.message,
    source?.response?.data?.message,
    source?.errorMessage,
    source?.message,
  ];

  const messageCandidate = candidates.find(
    (item) => typeof item === 'string' && item.trim().length > 0,
  );

  return (messageCandidate as string) ?? fallback;
};

export const useShipManagement = () => {
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const lastQueryRef = useRef<ShipListQuery>({ page: 1, pageSize: 10 });

  const loadShips = useCallback(async (query?: ShipListQuery) => {
    const mergedQuery: ShipListQuery = {
      ...lastQueryRef.current,
      ...query,
    };

    if (!mergedQuery.page || mergedQuery.page < 1) {
      mergedQuery.page = 1;
    }

    if (!mergedQuery.pageSize || mergedQuery.pageSize < 1) {
      mergedQuery.pageSize = 10;
    }

    lastQueryRef.current = mergedQuery;

    setLoading(true);
    try {
      const response = await fetchShips(mergedQuery);
      const items = response?.items?.data ?? [];
      const totalCount = response?.items?.totalCount ?? items.length;

      setShips(items);

      return {
        data: items,
        total: totalCount,
        success: true,
      };
    } catch (error) {
      const description = extractErrorMessage(error, 'Gagal memuat data kapal');
      message.error(description);
      setShips([]);
      return {
        data: [],
        total: 0,
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = useCallback(async (values: ShipFormValues) => {
    try {
      setCreating(true);
      const payload = toCreateShipPayload(values);
      const createdShip = await createShipApi(payload);
      message.success('Data kapal berhasil ditambahkan');
      return createdShip;
    } catch (error) {
      const description = extractErrorMessage(
        error,
        'Gagal menyimpan data kapal',
      );
      message.error(description);
      throw error;
    } finally {
      setCreating(false);
    }
  }, []);

  const summary = useMemo(() => deriveShipSummary(ships), [ships]);

  return {
    ships,
    loading,
    creating,
    summary,
    loadShips,
    createShip: handleCreate,
    setShips,
  };
};
