import dayjs from 'dayjs';
import type {
  PaginationMeta,
  SampleEstimationRecord,
} from '@/services/sample-estimations/typings';

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Terjadi kesalahan pada sistem';
};

export const normalizeStatus = (status?: string | null) =>
  typeof status === 'string' ? status.trim().toLowerCase() : '';

export const getStatusColor = (status?: string | null) => {
  switch (normalizeStatus(status)) {
    case 'available':
      return 'success';
    case 'low':
      return 'warning';
    case 'urgent':
      return 'error';
    case 'used':
      return 'processing';
    default:
      return 'default';
  }
};

export const getStatusLabel = (status?: string | null) => {
  switch (normalizeStatus(status)) {
    case 'available':
      return 'Tersedia';
    case 'low':
      return 'Terbatas';
    case 'urgent':
      return 'Urgent';
    case 'used':
      return 'Terpakai';
    default:
      return status ?? '-';
  }
};

export interface SummaryResult {
  total: number;
  available: number;
  low: number;
  urgent: number;
}

export const buildSummary = (
  records: SampleEstimationRecord[],
  meta: PaginationMeta,
): SummaryResult => {
  const total =
    typeof meta.totalData === 'number' ? meta.totalData : records.length;

  return records.reduce<SummaryResult>(
    (acc, record) => {
      const status = normalizeStatus(record.status);
      if (status === 'available') {
        acc.available += 1;
      } else if (status === 'low') {
        acc.low += 1;
      } else if (status === 'urgent' || status === 'critical') {
        acc.urgent += 1;
      }
      return acc;
    },
    {
      total,
      available: 0,
      low: 0,
      urgent: 0,
    },
  );
};

export type CalendarData = Record<
  string,
  Array<{
    type: 'success' | 'processing' | 'error' | 'warning' | 'default';
    content: string;
  }>
>;

export const buildCalendarData = (
  records: SampleEstimationRecord[],
): CalendarData =>
  records.reduce<CalendarData>((acc, record) => {
    const dateSource = record.etaReceivedAt ?? record.createdAt ?? null;
    if (!dateSource) {
      return acc;
    }

    const dateKey = dayjs(dateSource).format('YYYY-MM-DD');
    const statusColor = getStatusColor(record.status);
    const badgeStatus =
      statusColor === 'success' ||
      statusColor === 'processing' ||
      statusColor === 'error' ||
      statusColor === 'warning'
        ? statusColor
        : ('default' as const);

    const details = [
      record.typeLoadName,
      record.shipName ?? record.shipKode,
      record.tankiName ??
        (record.nomorTanki ? `Tangki ${record.nomorTanki}` : null),
    ].filter(Boolean);

    const quantityText =
      typeof record.qty === 'number'
        ? `${record.qty}${record.satuanName ? ` ${record.satuanName}` : ''}`
        : null;

    const content =
      details.length > 0
        ? `${details.join(' • ')}${quantityText ? ` • ${quantityText}` : ''}`
        : (quantityText ?? 'Estimasi sample');

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }

    acc[dateKey].push({
      type: badgeStatus,
      content,
    });

    return acc;
  }, {});
