import { message } from 'antd';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  createShip as createShipApi,
  deleteShip as deleteShipApi,
  fetchShips,
  updateShip as updateShipApi,
} from '@/services/ships/api';
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

const FIELD_ERROR_MAP: Record<string, string> = {
  KodeKapal: 'code',
  NamaKapal: 'name',
  Status: 'status',
  TypeLoadId: 'typeLoadId',
  TypeShipId: 'typeShipId',
  Bendera: 'flag',
  Perusahaan: 'company',
  NamaKapten: 'captainName',
  KapasitasMT: 'capacity',
  MaximalTanki: 'maximalTanki',
  TanggalKedatangan: 'arrivalDate',
  WaktuSelesaiOperasi: 'operationCompletionTime',
  DockId: 'dockId',
  ContactPerson: 'contactPerson',
  Telepon: 'phone',
  Email: 'email',
  PelabuhanAsal: 'originPort',
  PelabuhanTujuan: 'destinationPort',
  Catatan: 'notes',
};

type ShipValidationError = Error & {
  fieldErrors?: Record<string, string[]>;
  status?: number;
  raw?: unknown;
};

const extractValidationError = (error: unknown): ShipValidationError | null => {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const source = error as Record<string, any>;
  const response = source?.response;
  const data = response?.data;
  const errors = data?.errors;

  if (!errors || typeof errors !== 'object') {
    return null;
  }

  const mappedErrors: Record<string, string[]> = {};
  Object.entries(errors).forEach(([key, value]) => {
    const targetKey =
      FIELD_ERROR_MAP[key] ??
      (key.length > 0 ? key.charAt(0).toLowerCase() + key.slice(1) : key);

    const messages: string[] = Array.isArray(value)
      ? (value as unknown[]).map((item) => String(item))
      : [String(value)];

    if (!mappedErrors[targetKey]) {
      mappedErrors[targetKey] = [];
    }
    mappedErrors[targetKey].push(...messages);
  });

  const allMessages = Object.values(mappedErrors).flat();
  const messageText =
    (typeof data?.title === 'string' && data.title.trim()) ||
    allMessages.join(', ') ||
    'Validasi data gagal';

  const validationError: ShipValidationError = new Error(messageText);
  validationError.fieldErrors = mappedErrors;
  validationError.status =
    typeof data?.status === 'number' ? data.status : undefined;
  validationError.raw = data;

  return validationError;
};

export const useShipManagement = () => {
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
      const items = response?.data ?? [];
      const totalCount = response?.pagination?.totalData ?? items.length;

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
      const validationError = extractValidationError(error);
      if (validationError) {
        throw validationError;
      }
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

  const handleUpdate = useCallback(
    async (shipId: string, values: ShipFormValues) => {
      try {
        setUpdating(true);
        const payload = toCreateShipPayload(values);
        const updatedShip = await updateShipApi(shipId, payload);
        message.success('Data kapal berhasil diperbarui');
        setShips((prev) =>
          prev.map((ship) =>
            ship.id === updatedShip.id ? { ...ship, ...updatedShip } : ship,
          ),
        );
        return updatedShip;
      } catch (error) {
        const validationError = extractValidationError(error);
        if (validationError) {
          throw validationError;
        }
        const description = extractErrorMessage(
          error,
          'Gagal memperbarui data kapal',
        );
        message.error(description);
        throw error;
      } finally {
        setUpdating(false);
      }
    },
    [setShips],
  );

  const summary = useMemo(() => deriveShipSummary(ships), [ships]);

  const handleDelete = useCallback(
    async (shipId: string) => {
      if (!shipId) {
        throw new Error('ID kapal wajib diisi');
      }

      try {
        setDeleting(true);
        await deleteShipApi(shipId);
        setShips((prev) => prev.filter((ship) => ship.id !== shipId));
        message.success('Data kapal berhasil dihapus');
      } catch (error) {
        const description = extractErrorMessage(
          error,
          'Gagal menghapus data kapal',
        );
        message.error(description);
        throw error;
      } finally {
        setDeleting(false);
      }
    },
    [setShips],
  );

  return {
    ships,
    loading,
    creating,
    updating,
    deleting,
    summary,
    loadShips,
    createShip: handleCreate,
    updateShip: handleUpdate,
    deleteShip: handleDelete,
    setShips,
  };
};
