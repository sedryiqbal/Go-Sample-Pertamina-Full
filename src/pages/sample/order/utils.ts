import dayjs from 'dayjs';

import type {
  CategoryTest,
  LabReference,
  ProductType,
  SampleEstimationRecord,
  ShipReference,
  TankReference,
  UnitReference,
} from '../../services/sample-estimations/typings';
import type {
  AvailableSample,
  OrderPriority,
  OrderStatus,
  OrderType,
  SampleOrderRecord,
  SampleStatus,
  SelectOption,
  SummaryMetrics,
} from './types';

const SAMPLE_STATUS_COLOR_MAP: Record<string, string> = {
  available: 'success',
  low: 'warning',
  urgent: 'error',
  reserved: 'processing',
  pending: 'orange',
  unavailable: 'default',
};

const SAMPLE_STATUS_LABEL_MAP: Record<string, string> = {
  available: 'Tersedia',
  low: 'Terbatas',
  urgent: 'Urgent',
  reserved: 'Reservasi',
  pending: 'Pending',
  unavailable: 'Tidak Tersedia',
};

const PRIORITY_COLOR_MAP: Record<OrderPriority, string> = {
  normal: 'blue',
  urgent: 'red',
};

const STATUS_COLOR_MAP: Record<OrderStatus, string> = {
  pending: 'orange',
  confirmed: 'blue',
  picked_up: 'purple',
  in_transit: 'cyan',
  delivered: 'green',
  cancelled: 'red',
};

const STATUS_LABEL_MAP: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Dikonfirmasi',
  picked_up: 'Diambil',
  in_transit: 'Dalam Perjalanan',
  delivered: 'Terkirim',
  cancelled: 'Dibatalkan',
};

const RAW_STATUS_MAP: Record<string, SampleStatus> = {
  available: 'available',
  AVAILABLE: 'available',
  low: 'low',
  LOW: 'low',
  urgent: 'urgent',
  URGENT: 'urgent',
  reserved: 'reserved',
  RESERVED: 'reserved',
  pending: 'pending',
  PENDING: 'pending',
  unavailable: 'unavailable',
  UNAVAILABLE: 'unavailable',
};

export const normalizeSampleStatus = (status?: string | null): SampleStatus =>
  status ? (RAW_STATUS_MAP[status] ?? 'available') : 'available';

export const getSampleStatusColor = (status: SampleStatus) =>
  SAMPLE_STATUS_COLOR_MAP[status] ?? 'default';

export const getSampleStatusLabel = (status: SampleStatus) =>
  SAMPLE_STATUS_LABEL_MAP[status] ?? status;

export const getPriorityColor = (priority: OrderPriority) =>
  PRIORITY_COLOR_MAP[priority] ?? 'default';

export const getStatusColor = (status: OrderStatus) =>
  STATUS_COLOR_MAP[status] ?? 'default';

export const getStatusLabel = (status: OrderStatus) =>
  STATUS_LABEL_MAP[status] ?? status;

export const buildOrderNumber = (orderType: OrderType) => {
  const prefix = orderType === 'ready' ? 'SO' : 'RQ';
  const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${prefix}-${dayjs().format('YYYYMMDD')}-${sequence}`;
};

export const getLabDeliveryTime = (
  labValue: string,
  labOptions: SelectOption[],
): number => {
  if (!labValue) {
    return 1;
  }

  const match = labOptions.find(
    (lab) => lab.value?.toString() === labValue.toString(),
  );

  const timeCandidate = match?.meta?.time;
  if (typeof timeCandidate === 'number' && Number.isFinite(timeCandidate)) {
    return timeCandidate;
  }

  return 1;
};

export const computeSummary = (
  orders: SampleOrderRecord[],
): SummaryMetrics => ({
  total: orders.length,
  ready: orders.filter((item) => item.order_type === 'ready').length,
  request: orders.filter((item) => item.order_type === 'request').length,
  pending: orders.filter((item) => item.status === 'pending').length,
  in_progress: orders.filter((item) =>
    ['confirmed', 'picked_up', 'in_transit'].includes(item.status),
  ).length,
  delivered: orders.filter((item) => item.status === 'delivered').length,
});

export const transformAvailableSample = (
  sample: SampleEstimationRecord,
): AvailableSample => {
  const quantityRaw =
    sample.availableQty ?? sample.qty ?? sample.availableQty ?? 0;
  const quantity = Number(quantityRaw);
  const sampleType = sample.typeLoadName?.trim() ?? 'Unknown';
  const vesselName = sample.shipName?.trim() ?? 'Unknown Vessel';
  const tankName =
    sample.tankiName?.trim() ??
    (sample.nomorTanki !== null && sample.nomorTanki !== undefined
      ? `Tangki ${sample.nomorTanki}`
      : 'Unknown Tank');
  const unitName = sample.satuanName?.trim() ?? '';
  const location = sample.lokasi?.trim() ?? sample.unitName?.trim() ?? '';

  return {
    id: String(sample.id),
    sample_type: sampleType,
    sampleTypeId: sample.typeLoadId ?? null,
    vessel_name: vesselName,
    shipId: sample.shipId ?? null,
    tank_number: tankName,
    tankId: sample.nomorTanki ?? null,
    quantity: Number.isFinite(quantity) ? quantity : 0,
    available_quantity: sample.availableQty ?? null,
    unit: unitName,
    unitId: sample.satuanId ?? null,
    location,
    status: normalizeSampleStatus(sample.status),
    received_date: sample.etaReceivedAt ?? undefined,
    detailSample: sample.detailSample ?? null,
    raw: sample as Record<string, unknown>,
  };
};

export const mapSampleToFormValues = (sample: AvailableSample) => ({
  sample_type: sample.sample_type,
  vessel_name: sample.vessel_name,
  tank_number: sample.tank_number,
  unit: sample.unit || undefined,
});

export const isValidQuantity = (
  quantity: number | null | undefined,
): quantity is number => typeof quantity === 'number' && quantity > 0;

const createOption = (
  label?: string | null,
  value?: string | number | null,
  meta?: Record<string, unknown>,
): SelectOption | null => {
  if (!label || label.trim() === '') {
    return null;
  }

  if (value === null || value === undefined || value === '') {
    return null;
  }

  return {
    label,
    value,
    meta,
  };
};

export const mapProductTypesToOptions = (
  products: ProductType[],
): SelectOption[] =>
  products
    .map((product) =>
      createOption(product.name, product.name, { id: product.id }),
    )
    .filter((item): item is SelectOption => Boolean(item));

export const mapShipsToOptions = (ships: ShipReference[]): SelectOption[] =>
  ships
    .map((ship) =>
      createOption(ship.namaKapal, ship.namaKapal, {
        id: ship.id,
        kode: ship.kodeKapal,
      }),
    )
    .filter((item): item is SelectOption => Boolean(item));

export const mapTanksToOptions = (tanks: TankReference[]): SelectOption[] =>
  tanks
    .map((tank) => createOption(tank.name, tank.name, { id: tank.id }))
    .filter((item): item is SelectOption => Boolean(item));

export const mapUnitsToOptions = (units: UnitReference[]): SelectOption[] =>
  units
    .map((unit) => createOption(unit.name, unit.name, { id: unit.id }))
    .filter((item): item is SelectOption => Boolean(item));

export const mapCategoryTestsToOptions = (
  categories: CategoryTest[],
): SelectOption[] =>
  categories
    .map((category) =>
      createOption(category.name, category.name, {
        id: category.id,
        isActive: category.isActive,
      }),
    )
    .filter((item): item is SelectOption => Boolean(item));

export const mapLabsToOptions = (labs: LabReference[]): SelectOption[] =>
  labs
    .map((lab) =>
      createOption(lab.nama, lab.nama, {
        id: lab.id,
        description: lab.deskripsi,
        time: 1,
      }),
    )
    .filter((item): item is SelectOption => Boolean(item));
