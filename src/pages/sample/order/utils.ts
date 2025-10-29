import dayjs from 'dayjs';

import type {
  CategoryTest,
  LabReference,
  ProductType,
  SampleEstimationRecord,
  SampleOrderApiRecord,
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

const PRIORITY_MAP: Record<string, OrderPriority> = {
  normal: 'normal',
  urgent: 'urgent',
  high: 'urgent',
};

const STATUS_COLOR_MAP: Record<OrderStatus, string> = {
  pending: 'orange',
  waiting_pickup_sample: 'gold',
  in_transit: 'cyan',
  delivered: 'green',
  confirm_sample_in_lab: 'geekblue',
  registered_lab_sample: 'purple',
  start_testing: 'blue',
  completed_testing: 'green',
  comparation: 'volcano',
  completed_comparation: 'green',
  cancelled: 'red',
  confirmed: 'blue',
  picked_up: 'purple',
};

const STATUS_LABEL_MAP: Record<OrderStatus, string> = {
  pending: 'Pending',
  waiting_pickup_sample: 'Waiting Pickup Sample',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  confirm_sample_in_lab: 'Confirm Sample In Lab',
  registered_lab_sample: 'Registered Lab Sample',
  start_testing: 'Start Testing',
  completed_testing: 'Completed Testing',
  comparation: 'Comparation',
  completed_comparation: 'Completed Comparation',
  cancelled: 'Cancelled',
  confirmed: 'Confirmed',
  picked_up: 'Picked Up',
};

const STATUS_CODE_MAP: Record<number, OrderStatus> = {
  0: 'pending',
  1: 'waiting_pickup_sample',
  2: 'in_transit',
  3: 'delivered',
  4: 'confirm_sample_in_lab',
  5: 'registered_lab_sample',
  6: 'start_testing',
  7: 'completed_testing',
  8: 'comparation',
  9: 'completed_comparation',
  10: 'cancelled',
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

export const mapApiStatusToOrderStatus = (
  status: number | string | null | undefined,
): OrderStatus => {
  if (status === null || status === undefined || status === '') {
    return 'pending';
  }

  if (typeof status === 'string' && status.trim() !== '') {
    const numeric = Number(status);
    if (Number.isFinite(numeric) && STATUS_CODE_MAP[numeric]) {
      return STATUS_CODE_MAP[numeric];
    }

    const normalized = status.toLowerCase().replace(/[^a-z]/g, '');

    const STRING_STATUS_MAP: Record<string, OrderStatus> = {
      pending: 'pending',
      waitingpickupsample: 'waiting_pickup_sample',
      intransit: 'in_transit',
      delivered: 'delivered',
      confirmsampleinlab: 'confirm_sample_in_lab',
      confirmedsampleinlab: 'confirm_sample_in_lab',
      registeredlabsample: 'registered_lab_sample',
      starttesting: 'start_testing',
      completedtesting: 'completed_testing',
      comparation: 'comparation',
      completedcomparation: 'completed_comparation',
      cancelled: 'cancelled',
      canceled: 'cancelled',
      confirmed: 'confirmed',
      pickedup: 'picked_up',
    };

    return STRING_STATUS_MAP[normalized] ?? 'pending';
  }

  const normalized = Number(status);
  if (Number.isFinite(normalized) && STATUS_CODE_MAP[normalized]) {
    return STATUS_CODE_MAP[normalized];
  }

  return 'pending';
};

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
    [
      'waiting_pickup_sample',
      'in_transit',
      'confirm_sample_in_lab',
      'registered_lab_sample',
      'start_testing',
      'comparation',
    ].includes(item.status),
  ).length,
  delivered: orders.filter((item) =>
    ['delivered', 'completed_testing', 'completed_comparation'].includes(
      item.status,
    ),
  ).length,
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

export const transformSampleOrderRecord = (
  record: SampleOrderApiRecord,
): SampleOrderRecord => {
  const orderDate = record.tanggalOrder ? dayjs(record.tanggalOrder) : null;
  const etaArrival = record.etaArival ? dayjs(record.etaArival) : null;
  const estimatedHours =
    orderDate && etaArrival
      ? Math.max(1, Math.round(etaArrival.diff(orderDate, 'hour', true)))
      : 0;

  const tankLabel = record.tankiName
    ? record.tankiName
    : typeof record.nomorTangki === 'number'
      ? `Tangki ${record.nomorTangki}`
      : '-';

  const quantityValue = record.quantity ?? record.sample?.qty ?? 0;

  const priorityRaw =
    typeof record.priority === 'string'
      ? record.priority.toLowerCase()
      : record.priority;
  const priority: OrderPriority =
    typeof priorityRaw === 'string'
      ? (PRIORITY_MAP[priorityRaw] ?? 'normal')
      : 'normal';

  const orderTypeRaw = record.type?.toLowerCase();
  const orderType: OrderType = orderTypeRaw === 'request' ? 'request' : 'ready';

  const productName =
    record.typeLoadName ??
    record.jenisProduct ??
    (typeof record.sample?.typeLoadName === 'string'
      ? (record.sample.typeLoadName as string)
      : '-');

  const orderNumber = record.orderNo?.trim()
    ? record.orderNo
    : record.nomorNpc?.trim()
      ? record.nomorNpc
      : `SO-${record.id}`;

  const statusNormalized = mapApiStatusToOrderStatus(record.status ?? null);

  return {
    id: String(record.id),
    order_number: orderNumber,
    order_type: orderType,
    order_date: record.tanggalOrder ?? '',
    npc_number: record.nomorNpc ?? '-',
    sample_type: productName,
    vessel_name: record.shipName ?? record.sample?.shipName ?? '-',
    tank_number: tankLabel ?? '-',
    quantity: Number(quantityValue) ?? 0,
    unit: record.satuanName ?? record.sample?.satuanName ?? '',
    lab_location: record.labName ?? '-',
    category_test: record.categoryTestName ?? '-',
    estimated_delivery_time: estimatedHours,
    priority,
    status: statusNormalized,
    category: undefined,
    company_sender: undefined,
    sender_name: undefined,
    sender_phone: undefined,
    estimated_arrival: record.etaArival ?? undefined,
    photo_sample: record.pathPhotoSample ?? undefined,
    memo_file: record.pathMemo ?? undefined,
    notes: typeof record.notes === 'string' ? record.notes : undefined,
    created_at: record.createdAt ?? '',
    selected_sample_id:
      record.estimasiSampleId !== undefined && record.estimasiSampleId !== null
        ? String(record.estimasiSampleId)
        : undefined,
    lab_id: record.labId ?? null,
    category_test_id: record.categoryTestId ?? null,
    sample_estimation_id: record.estimasiSampleId ?? null,
    sample_type_id: record.typeLoadId ?? null,
    ship_id: record.shipId ?? null,
    tank_id: record.nomorTangki ?? null,
    unit_id: record.satuanId ?? null,
    order_status_code:
      typeof record.status === 'number'
        ? record.status
        : (Number(record.status) ?? null),
    status_label: getStatusLabel(statusNormalized),
    raw: record,
  };
};
