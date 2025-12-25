import {
  CalendarOutlined,
  CarOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  message,
  Row,
  Space,
  Statistic,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ProductQCListModal from '@/components/ProductQCListModal';
import ProductQCModal, {
  type CalculatedResults,
  type CoqDetail,
  type PortStarboardRecord,
  type ProductQCData,
  type ProductQCSampleData,
} from '@/components/ProductQCModal';
import type { ProductQcRecord } from '@/services/product-qc/api';
import {
  type CreateProductQcPayload,
  createProductQc,
  deleteProductQc,
  fetchProductQcByShip,
} from '@/services/product-qc/api';
import {
  fetchShipCargoTypes,
  fetchShipTypesReference,
} from '@/services/ships/api';
import ShipDetailModal from './components/ShipDetailModal';
import ShipFormDrawer from './components/ShipFormDrawer';
import {
  SHIP_STATUS_BADGE_COLOR,
  SHIP_STATUS_LABEL_MAP,
  SHIP_STATUS_OPTIONS,
  SHIP_TYPE_COLOR_MAP,
  SHIP_TYPE_OPTIONS,
} from './constants';
import { useShipManagement } from './hooks/useShipManagement';
import type { ShipFormValues, ShipTableRecord } from './types';
import { formatDateTime, safeText } from './utils';

const getShipTypeColor = (type: string) =>
  SHIP_TYPE_COLOR_MAP[type] || 'default';

const getStatusBadgeColor = (status: string) =>
  SHIP_STATUS_BADGE_COLOR[status] || 'default';

const getShipStatusLabel = (status: string) =>
  SHIP_STATUS_LABEL_MAP[status] || status;

const normalizeTextParam = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeNumberParam = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

type SelectOption = { label: string; value: number };

const dedupeOptions = (options: SelectOption[]): SelectOption[] => {
  const seen = new Set<string>();

  return options.filter((option) => {
    const key = option.value?.toString().trim();
    if (!key) {
      return false;
    }

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const normalizeName = (name?: string | null) => {
  if (typeof name !== 'string') {
    return undefined;
  }

  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const mapShipTypeOptions = (records: { id: number; name: string }[]) =>
  dedupeOptions(
    records
      .map((record) => {
        const name = normalizeName(record.name);
        const fallback = record.id ? `Ship Type #${record.id}` : undefined;
        const label = name ?? fallback;
        if (!label) {
          return undefined;
        }

        return {
          label,
          value: record.id,
        };
      })
      .filter(Boolean) as SelectOption[],
  );

const mapCargoTypeOptions = (records: { id: number; name: string }[]) =>
  dedupeOptions(
    records
      .map((record) => {
        const name = normalizeName(record.name);
        const fallback = record.id ? `Cargo Type #${record.id}` : undefined;
        const label = name ?? fallback;
        if (!label) {
          return undefined;
        }

        return {
          label,
          value: record.id,
        };
      })
      .filter(Boolean) as SelectOption[],
  );

type ProductQcFormState = ProductQCData & {
  calculatedResults?: CalculatedResults | null;
  __calc?: CalculatedResults | null;
};

interface ProductQCPdfDocumentProps {
  ship: ShipTableRecord;
  data: ProductQcFormState;
}

const ProductQCPdfDocument = React.forwardRef<
  HTMLDivElement,
  ProductQCPdfDocumentProps
>(({ ship, data }, ref) => {
  const calculations = data.calculatedResults || data.__calc || undefined;
  const portRecords = data.port_data || [];
  const starboardRecords = data.starboard_data || [];
  const coqDetails = data.coq_details || [];

  const baseCellStyle: React.CSSProperties = {
    border: '1px solid #e8e8e8',
    padding: '6px 8px',
    textAlign: 'center',
    fontSize: 12,
  };

  const headerCellStyle: React.CSSProperties = {
    ...baseCellStyle,
    backgroundColor: '#fafafa',
    fontWeight: 600,
  };

  const formatNumber = (value: unknown, fractionDigits = 3) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return '-';
    }

    return numeric.toLocaleString(undefined, {
      maximumFractionDigits: fractionDigits,
    });
  };

  const renderCompartmentRows = (records: PortStarboardRecord[]) =>
    records.map((record, index) => (
      <tr key={`${record.id ?? index}-${index}`}>
        <td style={{ ...baseCellStyle, fontWeight: 600 }}>{index + 1}</td>
        <td style={baseCellStyle}>{record.free_water || '-'}</td>
        <td style={baseCellStyle}>{record.suspended_water || '-'}</td>
        <td style={baseCellStyle}>
          {formatNumber(record.electrical_conductivity, 0)}
        </td>
        <td style={baseCellStyle}>
          {formatNumber(record.temperature_observed, 1)}
        </td>
        <td style={baseCellStyle}>
          {formatNumber(record.density_observed, 4)}
        </td>
        <td style={baseCellStyle}>{formatNumber(record.density_15c, 4)}</td>
        <td style={baseCellStyle}>{formatNumber(record.volume_liters, 3)}</td>
        <td style={baseCellStyle}>
          {formatNumber(record.dens_15c_x_volume, 3)}
        </td>
      </tr>
    ));

  const hasCoqDetail = coqDetails.some(
    (detail) => detail.coq_no || detail.issuance_date,
  );

  return (
    <div
      ref={ref}
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        backgroundColor: '#ffffff',
        color: '#262626',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        lineHeight: 1.4,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e8e8e8',
          paddingBottom: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
            PRODUCT QUALITY CHECK – BEFORE DISCHARGE
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Kapal: <strong>{safeText(ship.name)}</strong>{' '}
            {ship.code ? `(${safeText(ship.code)})` : ''} • Muatan:{' '}
            <strong>{safeText(ship.cargoType)}</strong>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            Kedatangan: {formatDateTime(ship.arrivalDate ?? undefined)} •
            Lokasi: {safeText(ship.portLocation)}
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#666', textAlign: 'right' }}>
          Generated at {formatDateTime(new Date().toISOString())}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ border: '1px solid #e8e8e8', borderRadius: 8 }}>
          <div
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid #e8e8e8',
              fontWeight: 600,
            }}
          >
            Informasi Kapal
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {[{
              label: 'Nama Kapal',
              value: safeText(ship.name),
            },
            {
              label: 'Tanggal Kedatangan',
              value: formatDateTime(ship.arrivalDate ?? undefined),
            },
            {
              label: 'Kapasitas',
              value: `${formatNumber(ship.capacity, 0)} KL`,
            },
            {
              label: 'Bendera',
              value: safeText(ship.flag),
            },
            {
              label: 'Perusahaan',
              value: safeText(ship.company),
            },
            {
              label: 'Kapten',
              value: safeText(ship.captainName),
            },
            {
              label: 'Pelabuhan Asal',
              value: safeText(ship.originPort),
            },
            {
              label: 'Pelabuhan Tujuan',
              value: safeText(ship.destinationPort),
            }].map((row) => (
              <tr key={row.label}>
                <td
                  style={{
                    ...baseCellStyle,
                    textAlign: 'left',
                    width: '45%',
                    backgroundColor: '#fafafa',
                    fontWeight: 600,
                  }}
                >
                  {row.label}
                </td>
                <td style={{ ...baseCellStyle, textAlign: 'left' }}>
                  {row.value}
                </td>
              </tr>
            ))}
          </table>
        </div>

        <div style={{ border: '1px solid #e8e8e8', borderRadius: 8 }}>
          <div
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid #e8e8e8',
              fontWeight: 600,
            }}
          >
            Ringkasan Perhitungan
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {[{
              label: 'Total (Dens@15°C × Volume)',
              value: formatNumber(calculations?.total_volume_dens_15c, 3),
            },
            {
              label: 'Total Volume',
              value: `${formatNumber(calculations?.total_volume, 3)} L`,
            },
            {
              label: 'Expected Density',
              value: `${formatNumber(calculations?.expected_density, 1)} kg/m³`,
            },
            {
              label: 'Refinery Certificate Density',
              value: `${formatNumber(
                calculations?.refinery_certificate_density,
                1,
              )} kg/m³`,
            },
            {
              label: 'Difference (Max 3)',
              value: `${formatNumber(calculations?.density_difference, 1)} kg/m³`,
            }].map((row) => (
              <tr key={row.label}>
                <td
                  style={{
                    ...baseCellStyle,
                    textAlign: 'left',
                    width: '65%',
                    backgroundColor: '#fafafa',
                    fontWeight: 600,
                  }}
                >
                  {row.label}
                </td>
                <td style={{ ...baseCellStyle, textAlign: 'left' }}>
                  {row.value}
                </td>
              </tr>
            ))}
          </table>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          Port Compartment
        </div>
        <table
          style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}
        >
          <thead>
            <tr>
              {['#', 'Free Water', 'Suspended Water', 'EC (µS/m)', 'Temp (°C)', 'Density Obs', 'Density @15°C', 'Volume (L)', 'D15 × V'].map(
                (header) => (
                  <th key={header} style={headerCellStyle}>
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>{renderCompartmentRows(portRecords)}</tbody>
        </table>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          Starboard Compartment
        </div>
        <table
          style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}
        >
          <thead>
            <tr>
              {['#', 'Free Water', 'Suspended Water', 'EC (µS/m)', 'Temp (°C)', 'Density Obs', 'Density @15°C', 'Volume (L)', 'D15 × V'].map(
                (header) => (
                  <th key={header} style={headerCellStyle}>
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>{renderCompartmentRows(starboardRecords)}</tbody>
        </table>
      </div>

      {hasCoqDetail ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Certificate of Quality
          </div>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}
          >
            <thead>
              <tr>
                <th style={headerCellStyle}>No</th>
                <th style={headerCellStyle}>COQ Number</th>
                <th style={headerCellStyle}>Issuance Date</th>
              </tr>
            </thead>
            <tbody>
              {coqDetails.map((detail, index) => (
                <tr key={`coq-${index}`}>
                  <td style={baseCellStyle}>{index + 1}</td>
                  <td style={baseCellStyle}>{detail.coq_no || '-'}</td>
                  <td style={baseCellStyle}>
                    {detail.issuance_date
                      ? formatDateTime(detail.issuance_date)
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            Catatan Port
          </div>
          <div
            style={{
              border: '1px solid #e8e8e8',
              minHeight: 80,
              padding: 8,
            }}
          >
            {safeText(data.port_note) || '-'}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            Catatan Starboard
          </div>
          <div
            style={{
              border: '1px solid #e8e8e8',
              minHeight: 80,
              padding: 8,
            }}
          >
            {safeText(data.starboard_note) || '-'}
          </div>
        </div>
      </div>
    </div>
  );
});

ProductQCPdfDocument.displayName = 'ProductQCPdfDocument';

const Ships: React.FC = () => {
  const [form] = Form.useForm<ShipFormValues>();
  const actionRef = useRef<ActionType | null>(null);

  const {
    summary,
    loading,
    creating,
    updating,
    deleting,
    createShip,
    updateShip,
    deleteShip,
    setShips,
    loadShips,
  } = useShipManagement();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingShip, setEditingShip] = useState<ShipTableRecord | null>(null);
  const [qcModalVisible, setQcModalVisible] = useState(false);
  const [qcShip, setQcShip] = useState<ShipTableRecord | null>(null);
  const [qcDataByShip, setQcDataByShip] = useState<
    Record<string, ProductQcFormState>
  >({});
  const [qcListVisible, setQcListVisible] = useState(false);
  const [qcRecords, setQcRecords] = useState<ProductQcRecord[]>([]);
  const [qcRecordsLoading, setQcRecordsLoading] = useState(false);
  const [selectedQcRecord, setSelectedQcRecord] =
    useState<ProductQcRecord | null>(null);
  const [qcAvailabilityByShip, setQcAvailabilityByShip] = useState<
    Record<string, boolean>
  >({});
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailShip, setDetailShip] = useState<ShipTableRecord | null>(null);
  const [creatingProductQc, setCreatingProductQc] = useState(false);
  const [deletingQcId, setDeletingQcId] = useState<string | number | null>(
    null,
  );
  const [pdfPreviewState, setPdfPreviewState] = useState<
    { ship: ShipTableRecord; data: ProductQcFormState } | null
  >(null);
  const pdfPreviewRef = useRef<HTMLDivElement | null>(null);
  const [pdfGeneratingShipId, setPdfGeneratingShipId] = useState<
    string | number | null
  >(null);
  const [shipTypeOptions, setShipTypeOptions] = useState<SelectOption[]>([]);
  const [cargoTypeOptions, setCargoTypeOptions] = useState<SelectOption[]>([]);

  const handleFormApiError = useCallback(
    (error: unknown) => {
      if (!error || typeof error !== 'object') {
        return;
      }

      const source = error as {
        fieldErrors?: Record<string, unknown>;
        message?: string;
      };
      if (source.fieldErrors && typeof source.fieldErrors === 'object') {
        const fieldEntries = Object.entries(source.fieldErrors);
        form.setFields(
          fieldEntries.map(([name, value]) => {
            const messages = Array.isArray(value)
              ? value.map((item) => String(item))
              : [String(value)];
            return {
              name: name as keyof ShipFormValues,
              errors: messages,
            };
          }),
        );

        const allMessages = fieldEntries
          .flatMap(([, value]) =>
            Array.isArray(value)
              ? value.map((item) => String(item))
              : [String(value)],
          )
          .filter((item) => item && item.trim().length > 0);
        const uniqueMessages = Array.from(new Set(allMessages));
        if (uniqueMessages.length > 0) {
          message.error(uniqueMessages.join(', '));
        } else if (source.message && source.message.trim()) {
          message.error(source.message);
        }
        return;
      }

      if (source.message && source.message.trim()) {
        message.error(source.message);
      }
    },
    [form],
  );

  const loadProductQcRecords = useCallback(
    async (shipId: string | number | null | undefined) => {
      if (shipId === null || shipId === undefined || shipId === '') {
        return;
      }

      const shipKey = String(shipId);
      setQcRecordsLoading(true);
      setQcRecords([]);

      try {
        const records = await fetchProductQcByShip(shipId);
        setQcRecords(records);
        setQcAvailabilityByShip((prev) => ({
          ...prev,
          [shipKey]: records.length > 0,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Gagal memuat data Product QC';
        message.error(errorMessage);
        setQcRecords([]);
        setQcAvailabilityByShip((prev) => ({
          ...prev,
          [shipKey]: false,
        }));
      } finally {
        setQcRecordsLoading(false);
      }
    },
    [fetchProductQcByShip],
  );

  const handleTableRequest = useCallback(
    async (params: Record<string, any>) => {
      const { current = 1, pageSize = 10, search, typeShipId, typeLoadId } =
        params ?? {};

      return loadShips({
        page: Number(current) || 1,
        pageSize: Number(pageSize) || 10,
        search: normalizeTextParam(search),
        typeShipId: normalizeNumberParam(typeShipId),
        typeLoadId: normalizeNumberParam(typeLoadId),
      });
    },
    [loadShips],
  );

  useEffect(() => {
    let isActive = true;
    const loadFilterOptions = async () => {
      const [typesResult, cargoResult] = await Promise.allSettled([
        fetchShipTypesReference(),
        fetchShipCargoTypes(),
      ]);

      if (typesResult.status === 'fulfilled' && isActive) {
        setShipTypeOptions(mapShipTypeOptions(typesResult.value));
      } else if (typesResult.status === 'rejected') {
        message.error('Gagal memuat data tipe kapal untuk filter.');
      }

      if (cargoResult.status === 'fulfilled' && isActive) {
        setCargoTypeOptions(mapCargoTypeOptions(cargoResult.value));
      } else if (cargoResult.status === 'rejected') {
        message.error('Gagal memuat data jenis muatan untuk filter.');
      }
    };

    loadFilterOptions();

    return () => {
      isActive = false;
    };
  }, []);

  const convertWaterFlag = useCallback(
    (value: number | null | undefined): 'P' | 'N' | '' =>
      value === 1 ? 'P' : value === 0 ? 'N' : '',
    [],
  );

  const toNullableNumber = useCallback((value: unknown): number | null => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }, []);

  const mapProductQcRecordToSampleData = useCallback(
    (record: ProductQcRecord): ProductQCSampleData => {
      const portRecords: Partial<PortStarboardRecord>[] = [];
      const starboardRecords: Partial<PortStarboardRecord>[] = [];

      (record.compartmentData ?? []).forEach((item, index) => {
        const normalized: Partial<PortStarboardRecord> = {
          id: item.id ?? index + 1,
          free_water: convertWaterFlag(item.freeWater),
          suspended_water: convertWaterFlag(item.suspendedWater),
          electrical_conductivity: toNullableNumber(
            item.electricalConductivity,
          ),
          temperature_observed: toNullableNumber(item.temperatureObserved),
          density_observed: toNullableNumber(item.densityObserved),
          density_15c: toNullableNumber(item.densityAt15C),
          batch_density_15c: toNullableNumber(item.batchDensity),
          diff: toNullableNumber(item.diff),
          volume_liters: null,
          dens_15c_x_volume: null,
          notes: item.notes ?? null,
        };

        if (item.type === 0) {
          portRecords.push(normalized);
        } else {
          starboardRecords.push(normalized);
        }
      });

      const coqDetails: CoqDetail[] = (record.rCoQs ?? []).map((coq) => ({
        coq_no: coq.no ?? '',
        issuance_date: coq.date ?? '',
      }));

      return {
        vessel_name: record.shipName,
        name_of_tanker: record.shipName ? `MT. ${record.shipName}` : undefined,
        arrival_date: record.arrivalDate ?? undefined,
        refinery_terminal: record.refineryTerminal,
        grade_of_product: record.gradeOfProduct,
        sample_type: record.gradeOfProduct,
        quantity_in_batch:
          record.quantityInBatch !== null &&
            record.quantityInBatch !== undefined
            ? record.quantityInBatch
            : undefined,
        port_data: portRecords,
        starboard_data: starboardRecords,
        coq_details: coqDetails.length > 0 ? coqDetails : undefined,
      };
    },
    [convertWaterFlag, toNullableNumber],
  );

  const mapProductQcRecordToFormState = useCallback(
    (record: ProductQcRecord): ProductQcFormState => {
      const portRecords: PortStarboardRecord[] = [];
      const starboardRecords: PortStarboardRecord[] = [];

      (record.compartmentData ?? []).forEach((item, index) => {
        const normalized: PortStarboardRecord = {
          id: item.id ?? index + 1,
          free_water: convertWaterFlag(item.freeWater),
          suspended_water: convertWaterFlag(item.suspendedWater),
          electrical_conductivity: toNullableNumber(
            item.electricalConductivity,
          ),
          temperature_observed: toNullableNumber(item.temperatureObserved),
          density_observed: toNullableNumber(item.densityObserved),
          density_15c: toNullableNumber(item.densityAt15C),
          batch_density_15c: toNullableNumber(item.batchDensity),
          diff: toNullableNumber(item.diff),
          volume_liters: null,
          dens_15c_x_volume: null,
          notes: item.notes ?? null,
        };

        if (item.type === 0) {
          portRecords.push(normalized);
        } else {
          starboardRecords.push(normalized);
        }
      });

      const coqDetails: CoqDetail[] = (record.rCoQs ?? []).map((coq) => ({
        coq_no: coq.no ?? '',
        issuance_date: coq.date ?? '',
      }));

      return {
        name_of_tanker: record.shipName
          ? `MT. ${record.shipName}`
          : record.shipName ?? '',
        arrival_date: record.arrivalDate ?? '',
        quantity_in_batch:
          typeof record.quantityInBatch === 'number'
            ? record.quantityInBatch
            : 0,
        refinery_terminal: record.refineryTerminal ?? '',
        grade_of_product: record.gradeOfProduct ?? '',
        coq_details: coqDetails,
        port_note: '',
        starboard_note: '',
        port_data: portRecords,
        starboard_data: starboardRecords,
        calculatedResults: undefined,
        __calc: undefined,
      };
    },
    [convertWaterFlag, toNullableNumber],
  );

  const convertWaterToNumeric = useCallback(
    (value: 'P' | 'N' | '' | null | undefined): number =>
      value === 'P' ? 1 : 0,
    [],
  );

  const toNumberOrZero = useCallback((value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return 0;
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }, []);

  const parseDateToIso = useCallback((value?: string | null) => {
    if (!value) {
      return null;
    }

    const formats = ['DD MMM YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'];
    let parsed: dayjs.Dayjs | null = null;

    for (const format of formats) {
      const candidate = dayjs(value, format, true);
      if (candidate.isValid()) {
        parsed = candidate;
        break;
      }
    }

    if (!parsed) {
      const fallback = dayjs(value);
      parsed = fallback.isValid() ? fallback : null;
    }

    return parsed ? parsed.toISOString() : null;
  }, []);

  const buildCreateProductQcPayload = useCallback(
    (
      ship: ShipTableRecord,
      formData: ProductQCData,
    ): CreateProductQcPayload => {
      const numericShipId = Number(ship.id);
      if (!Number.isFinite(numericShipId)) {
        throw new Error('Ship ID tidak valid untuk Product QC');
      }

      const arrivalDateIso =
        parseDateToIso(formData.arrival_date) ??
        (ship.arrivalDate
          ? dayjs(ship.arrivalDate).toISOString()
          : undefined) ??
        new Date().toISOString();

      const normalizeCompartment = (
        records: PortStarboardRecord[],
        type: number,
      ) =>
        records
          .filter((record) => {
            const hasNumeric =
              record.temperature_observed !== null ||
              record.density_observed !== null ||
              record.electrical_conductivity !== null ||
              record.batch_density_15c !== null ||
              record.diff !== null;
            const hasWaterFlag =
              record.free_water === 'P' ||
              record.free_water === 'N' ||
              record.suspended_water === 'P' ||
              record.suspended_water === 'N';
            return hasNumeric || hasWaterFlag;
          })
          .map((record) => ({
            type,
            freeWater: convertWaterToNumeric(record.free_water),
            suspendedWater: convertWaterToNumeric(record.suspended_water),
            electricalConductivity: toNumberOrZero(
              record.electrical_conductivity,
            ),
            temperatureObserved: toNumberOrZero(record.temperature_observed),
            densityObserved: toNumberOrZero(record.density_observed),
            densityAt15C:
              record.density_15c !== null && record.density_15c !== undefined
                ? Number(record.density_15c)
                : undefined,
            batchDensity: toNumberOrZero(record.batch_density_15c),
            diff: toNumberOrZero(record.diff),
            notes:
              record.notes !== undefined && record.notes !== null
                ? String(record.notes)
                : '',
          }));

      const compartmentData = [
        ...normalizeCompartment(formData.port_data, 0),
        ...normalizeCompartment(formData.starboard_data, 1),
      ];

      if (compartmentData.length === 0) {
        throw new Error(
          'Tambahkan minimal satu data compartment sebelum menyimpan Product QC',
        );
      }

      const rCoQs = (formData.coq_details ?? [])
        .filter(
          (item) =>
            (item.coq_no && item.coq_no.trim().length > 0) ||
            (item.issuance_date && item.issuance_date.trim().length > 0),
        )
        .map((item) => ({
          no: item.coq_no?.trim() ?? '',
          date: parseDateToIso(item.issuance_date) ?? new Date().toISOString(),
        }));

      return {
        shipID: numericShipId,
        arrivalDate: arrivalDateIso,
        quantityInBatch: Number(formData.quantity_in_batch ?? 0),
        refineryTerminal: formData.refinery_terminal?.trim() ?? '',
        gradeOfProduct: formData.grade_of_product?.trim() ?? '',
        compartmentData,
        rCoQs,
      };
    },
    [convertWaterToNumeric, parseDateToIso, toNumberOrZero],
  );

  const handleAdd = useCallback(() => {
    setEditingShip(null);
    form.resetFields();
    setDrawerVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: ShipTableRecord) => {
      setEditingShip(record);
      form.setFieldsValue({
        name: record.name ?? '',
        code: record.code ?? undefined,
        typeShipId: record.typeShipId ?? undefined,
        flag: record.flag ?? undefined,
        company: record.company ?? undefined,
        captainName: record.captainName ?? undefined,
        capacity: record.capacity ?? undefined,
        maximalTanki: record.maximalTanki ?? undefined,
        typeLoadId: record.typeLoadId ?? undefined,
        arrivalDate: record.arrivalDate ? dayjs(record.arrivalDate) : undefined,
        operationCompletionTime: record.operationCompletionTime
          ? dayjs(record.operationCompletionTime)
          : undefined,
        dockId: record.dockId ?? undefined,
        status: record.status ?? undefined,
        contactPerson: record.contactPerson ?? undefined,
        phone: record.phone ?? undefined,
        email: record.email ?? undefined,
        originPort: record.originPort ?? undefined,
        destinationPort: record.destinationPort ?? undefined,
        notes: record.notes ?? undefined,
      });
      setDrawerVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback(
    (record: ShipTableRecord) => {
      Modal.confirm({
        title: 'Konfirmasi Hapus',
        content: `Apakah Anda yakin ingin menghapus data kapal ${record.name}?`,
        okText: 'Hapus',
        okType: 'danger',
        cancelText: 'Batal',
        onOk: async () => {
          try {
            await deleteShip(record.id);
            actionRef.current?.reload();
          } catch (_error) {
            // Error notification already ditangani oleh hook.
          }
        },
      });
    },
    [deleteShip],
  );

  const handleOpenQC = useCallback(
    (record: ShipTableRecord) => {
      setQcShip(record);
      setSelectedQcRecord(null);
      setQcModalVisible(false);
      setQcListVisible(true);
      loadProductQcRecords(record.id);
    },
    [loadProductQcRecords],
  );

  const handleShowDetail = useCallback((record: ShipTableRecord) => {
    setDetailShip(record);
    setDetailVisible(true);
  }, []);

  const handleSubmitQC = useCallback(
    async (data: ProductQCData) => {
      if (!qcShip) {
        throw new Error('Data kapal tidak ditemukan');
      }

      setCreatingProductQc(true);
      try {
        const payload = buildCreateProductQcPayload(qcShip, data);
        await createProductQc(payload);

        const shipKey = String(qcShip.id);
        setQcDataByShip((prev) => ({ ...prev, [shipKey]: data }));
        setQcAvailabilityByShip((prev) => ({ ...prev, [shipKey]: true }));

        message.success('Product QC untuk kapal berhasil disimpan');
        setQcModalVisible(false);
        setSelectedQcRecord(null);
        setQcListVisible(true);
        await loadProductQcRecords(qcShip.id);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Gagal menyimpan Product QC';
        throw new Error(errorMessage);
      } finally {
        setCreatingProductQc(false);
      }
    },
    [qcShip, buildCreateProductQcPayload, loadProductQcRecords],
  );

  const handleSelectExistingQc = useCallback(
    (record: ProductQcRecord) => {
      setSelectedQcRecord(record);
      setQcListVisible(false);
      setQcModalVisible(true);
      const shipKey = String(record.shipID);
      setQcDataByShip((prev) => ({
        ...prev,
        [shipKey]: mapProductQcRecordToFormState(record),
      }));
    },
    [mapProductQcRecordToFormState],
  );

  const handleCreateQcFromList = useCallback(() => {
    if (!qcShip) {
      message.warning('Silakan pilih kapal terlebih dahulu');
      return;
    }
    setSelectedQcRecord(null);
    setQcModalVisible(true);
    setQcListVisible(false);
  }, [qcShip]);

  const handleDeleteQcRecord = useCallback(
    async (record: ProductQcRecord) => {
      const targetShipId = qcShip?.id ?? record.shipID;
      const shipKey = String(targetShipId);

      setDeletingQcId(record.id);
      try {
        await deleteProductQc(record.id);

        setQcRecords((prev) => {
          const next = prev.filter((item) => item.id !== record.id);
          setQcAvailabilityByShip((prevAvailability) => ({
            ...prevAvailability,
            [shipKey]: next.length > 0,
          }));
          return next;
        });

        setQcDataByShip((prev) => {
          if (prev[shipKey] === undefined) {
            return prev;
          }
          const next = { ...prev };
          delete next[shipKey];
          return next;
        });

        if (selectedQcRecord?.id === record.id) {
          setSelectedQcRecord(null);
          setQcModalVisible(false);
        }

        message.success('Product QC berhasil dihapus');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Gagal menghapus Product QC';
        message.error(errorMessage);
      } finally {
        setDeletingQcId(null);
      }
    },
    [qcShip, selectedQcRecord],
  );

  const fetchLatestProductQcData = useCallback(
    async (ship: ShipTableRecord): Promise<ProductQcFormState | undefined> => {
      try {
        const records = await fetchProductQcByShip(ship.id);
        if (!records.length) {
          message.warning('Belum ada Product QC untuk kapal ini');
          return undefined;
        }

        const latestRecord = records[0];
        const mapped = mapProductQcRecordToFormState(latestRecord);
        const shipKey = String(ship.id);
        setQcDataByShip((prev) => ({ ...prev, [shipKey]: mapped }));
        setQcAvailabilityByShip((prev) => ({ ...prev, [shipKey]: true }));
        return mapped;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Gagal memuat Product QC';
        message.error(errorMessage);
        return undefined;
      }
    },
    [mapProductQcRecordToFormState],
  );

  const handleDownloadProductQcPdf = useCallback(
    async (ship: ShipTableRecord, data?: ProductQcFormState) => {
      if (typeof window === 'undefined') {
        return;
      }

      const waitForNextFrame = () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        });

      try {
        setPdfGeneratingShipId(ship.id);
        let productQcData = data;

        if (!productQcData) {
          productQcData = await fetchLatestProductQcData(ship);
          if (!productQcData) {
            return;
          }
        }

        setPdfPreviewState({ ship, data: productQcData });
        await waitForNextFrame();

        if (!pdfPreviewRef.current) {
          throw new Error('Konten PDF belum siap');
        }

        const canvas = await html2canvas(pdfPreviewRef.current, {
          scale: 2,
          useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }

        const normalizedName = safeText(ship.name || '')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-]/g, '');
        const filename = `product-qc-${normalizedName || ship.id}.pdf`;

        pdf.save(filename);
        message.success('Product QC berhasil diekspor ke PDF');
      } catch (error) {
        console.error('Failed to generate Product QC PDF', error);
        message.error('Gagal mengekspor Product QC ke PDF');
      } finally {
        setPdfGeneratingShipId((current) =>
          current === ship.id ? null : current,
        );
        setPdfPreviewState(null);
      }
    },
    [fetchLatestProductQcData],
  );

  const qcModalSampleData = useMemo<ProductQCSampleData | undefined>(() => {
    if (selectedQcRecord) {
      return mapProductQcRecordToSampleData(selectedQcRecord);
    }

    if (qcShip) {
      return {
        vessel_name: qcShip.name,
        name_of_tanker: qcShip.name ? `MT. ${qcShip.name}` : undefined,
        sample_type: qcShip.cargoType ?? undefined,
        grade_of_product: qcShip.cargoType ?? undefined,
        refinery_terminal: qcShip.portLocation ?? undefined,
        arrival_date: qcShip.arrivalDate ?? undefined,
      };
    }

    return undefined;
  }, [selectedQcRecord, qcShip, mapProductQcRecordToSampleData]);

  const handleDrawerClose = useCallback(() => {
    setDrawerVisible(false);
    setEditingShip(null);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(
    async (values: ShipFormValues) => {
      if (editingShip) {
        try {
          await updateShip(editingShip.id, values);
          handleDrawerClose();
          actionRef.current?.reload();
        } catch (error) {
          handleFormApiError(error);
        }
        return;
      }

      try {
        const createdShip = await createShip(values);
        setShips((prev) => [createdShip, ...prev]);
        handleDrawerClose();
        actionRef.current?.setPageInfo?.({ current: 1 });
        actionRef.current?.reload();
      } catch (error) {
        handleFormApiError(error);
      }
    },
    [
      createShip,
      editingShip,
      handleDrawerClose,
      handleFormApiError,
      setShips,
      updateShip,
    ],
  );

  const columns = useMemo<ProColumns<ShipTableRecord>[]>(
    () => [
      {
        title: 'Nama Kapal',
        dataIndex: 'name',
        key: 'name',
        width: 240,
        fixed: 'left',
        hideInSearch: true,
        render: (_, record) => (
          <Space>
            <CarOutlined style={{ color: '#fd0017' }} />
            <div>
              <div style={{ fontWeight: 500 }}>{record.name}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{record.code}</div>
            </div>
          </Space>
        ),
      },
      {
        title: 'Pencarian',
        dataIndex: 'search',
        key: 'search',
        valueType: 'text',
        hideInTable: true,
      },
      {
        title: 'Tipe Kapal',
        dataIndex: 'typeShipId',
        key: 'typeShipId',
        valueType: 'select',
        hideInTable: true,
        fieldProps: {
          options: shipTypeOptions,
          allowClear: true,
        },
      },
      {
        title: 'Jenis Muatan',
        dataIndex: 'typeLoadId',
        key: 'typeLoadId',
        valueType: 'select',
        hideInTable: true,
        fieldProps: {
          options: cargoTypeOptions,
          allowClear: true,
        },
      },
      {
        title: 'Tipe Kapal',
        dataIndex: 'type',
        key: 'type',
        valueType: 'select',
        width: 140,
        hideInSearch: true,
        fieldProps: {
          options: SHIP_TYPE_OPTIONS,
          allowClear: true,
        },
        render: (_, record) => (
          <Tag color={getShipTypeColor(record.type || '')}>
            {safeText(record.type)}
          </Tag>
        ),
      },
      {
        title: 'Perusahaan',
        dataIndex: 'company',
        key: 'company',
        ellipsis: true,
        width: 220,
        hideInSearch: true,
        render: (_, record) => safeText(record.company),
      },
      {
        title: 'Muatan',
        dataIndex: 'cargoType',
        key: 'cargoType',
        hideInSearch: true,
        width: 160,
        render: (_, record) =>
          record.cargoType ? (
            <Tag color="cyan">{record.cargoType}</Tag>
          ) : (
            safeText(record.cargoType)
          ),
      },
      {
        title: 'Kedatangan',
        dataIndex: 'arrivalDate',
        key: 'arrivalDate',
        valueType: 'dateTime',
        hideInSearch: true,
        width: 180,
        render: (_, record) => formatDateTime(record.arrivalDate ?? undefined),
      },
      {
        title: 'Selesai Operasi',
        dataIndex: 'operationCompletionTime',
        key: 'operationCompletionTime',
        valueType: 'dateTime',
        hideInSearch: true,
        width: 180,
        render: (_, record) =>
          record.operationCompletionTime ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ color: '#52c41a', marginRight: 4 }} />
              <span>
                {formatDateTime(record.operationCompletionTime ?? undefined)}
              </span>
            </div>
          ) : (
            <span style={{ color: '#999' }}>-</span>
          ),
      },
      {
        title: 'Lokasi Dermaga',
        dataIndex: 'portLocation',
        key: 'portLocation',
        hideInSearch: true,
        width: 200,
        render: (_, record) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutlined style={{ color: '#fd0017', marginRight: 4 }} />
            <span>{safeText(record.portLocation)}</span>
          </div>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        valueType: 'select',
        width: 160,
        hideInSearch: true,
        fieldProps: {
          options: SHIP_STATUS_OPTIONS,
          allowClear: true,
        },
        render: (_, record) => (
          <Badge
            status={getStatusBadgeColor(record.status)}
            text={getShipStatusLabel(record.status)}
          />
        ),
      },
      {
        title: 'Kontak',
        dataIndex: 'contactPerson',
        key: 'contactPerson',
        hideInSearch: true,
        width: 220,
        render: (_, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>
              {safeText(record.contactPerson)}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {safeText(record.phone)}
            </div>
          </div>
        ),
      },
      {
        title: 'QC Selesai',
        dataIndex: 'isQCCompleted',
        key: 'isQCCompleted',
        width: 140,
        hideInSearch: true,
        render: (_, record) => {
          const shipKey = String(record.id);
          const isCompleted =
            record.isQCCompleted ?? qcAvailabilityByShip[shipKey] ?? false;
          return isCompleted ? (
            <Tag color="green">Selesai</Tag>
          ) : (
            <Tag color="red">Belum</Tag>
          );
        },
      },
      {
        title: 'Aksi',
        key: 'actions',
        width: 420,
        hideInSearch: true,
        render: (_, record) => {
          const shipKey = String(record.id);
          const hasQcRecords = qcAvailabilityByShip[shipKey] ?? false;
          const hasLocalQcData = !!qcDataByShip[shipKey];
          const canGeneratePdf =
            hasLocalQcData || hasQcRecords || !!record.isQCCompleted;
          return (
            <Space size={8} wrap={false}>
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleShowDetail(record)}
              >
                Detail
              </Button>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                Edit
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={deleting}
                onClick={() => handleDelete(record)}
              >
                Hapus
              </Button>
              <Button
                size="small"
                type={hasQcRecords ? 'default' : 'primary'}
                icon={<FileDoneOutlined />}
                onClick={() => handleOpenQC(record)}
                style={{ borderRadius: 16 }}
              >
                Product QC
              </Button>
              <Button
                size="small"
                icon={<FileTextOutlined />}
                disabled={!canGeneratePdf}
                loading={pdfGeneratingShipId === record.id}
                onClick={() =>
                  handleDownloadProductQcPdf(record, qcDataByShip[shipKey])
                }
                style={{ borderRadius: 16 }}
              >
                PDF
              </Button>
            </Space>
          );
        },
      },
    ],
    [
      handleDelete,
      handleEdit,
      handleOpenQC,
      handleShowDetail,
      handleDownloadProductQcPdf,
      qcDataByShip,
      qcAvailabilityByShip,
      pdfGeneratingShipId,
      shipTypeOptions,
      cargoTypeOptions,
    ],
  );

  return (
    <PageContainer
      title="Manajemen Kapal"
      content="Kelola data kapal import dan tracking status kedatangan serta keberangkatan"
      extra={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          Tambah Kapal
        </Button>,
      ]}
    >
      {/* <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Kapal"
              value={summary.total}
              prefix={<CarOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card loading={loading}>
            <Statistic
              title="Terjadwal"
              value={summary.scheduled}
              prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card loading={loading}>
            <Statistic
              title="Beroperasi"
              value={summary.inOperation}
              prefix={<EnvironmentOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card loading={loading}>
            <Statistic
              title="Tiba"
              value={summary.arrived}
              prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row> */}

      <ProTable<ShipTableRecord>
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        columns={columns}
        request={handleTableRequest}
        loading={loading}
        scroll={{ x: 1800 }}
        tableLayout="fixed"
        sticky
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="Daftar Kapal"
        toolBarRender={() => [
          <Button
            key="refresh"
            onClick={() => actionRef.current?.reload()}
            loading={loading}
          >
            Muat Ulang
          </Button>,
        ]}
      />

      <ShipFormDrawer
        form={form}
        open={drawerVisible}
        submitting={editingShip ? updating : creating}
        title={editingShip ? 'Edit Data Kapal' : 'Tambah Data Kapal Baru'}
        onClose={handleDrawerClose}
        onSubmit={handleSubmit}
      />

      <ShipDetailModal
        open={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setDetailShip(null);
        }}
        ship={detailShip}
      />

      <ProductQCListModal
        open={qcListVisible}
        loading={qcRecordsLoading}
        ship={qcShip}
        records={qcRecords}
        onClose={() => {
          setQcListVisible(false);
          setSelectedQcRecord(null);
          setQcRecords([]);
          setQcShip(null);
        }}
        onSelect={handleSelectExistingQc}
        onCreateNew={qcShip ? handleCreateQcFromList : undefined}
        onDelete={handleDeleteQcRecord}
        deletingId={deletingQcId}
      />

      <ProductQCModal
        visible={qcModalVisible}
        onClose={() => {
          setQcModalVisible(false);
          setSelectedQcRecord(null);
          if (qcShip) {
            setQcListVisible(true);
          }
        }}
        sampleData={qcModalSampleData}
        onSubmit={handleSubmitQC}
        viewOnly={!!selectedQcRecord}
        submitting={creatingProductQc}
        ship={qcShip}
        shipId={qcShip?.id ?? null}
      />

      {pdfPreviewState ? (
        <div
          style={{
            position: 'fixed',
            top: -9999,
            left: -9999,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1,
          }}
          aria-hidden
        >
          <ProductQCPdfDocument
            ref={pdfPreviewRef}
            ship={pdfPreviewState.ship}
            data={pdfPreviewState.data}
          />
        </div>
      ) : null}
    </PageContainer>
  );
};

export default Ships;
