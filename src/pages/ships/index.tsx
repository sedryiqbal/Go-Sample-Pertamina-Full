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
import React, { useCallback, useMemo, useRef, useState } from 'react';
import ProductQCListModal from '@/components/ProductQCListModal';
import ProductQCModal, {
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
    Record<string, ProductQCData>
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
      const { current = 1, pageSize = 10, search } = params ?? {};

      return loadShips({
        page: Number(current) || 1,
        pageSize: Number(pageSize) || 10,
        search: normalizeTextParam(search),
      });
    },
    [loadShips],
  );

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

  const convertWaterToNumeric = useCallback(
    (value: 'P' | 'N' | '' | null | undefined): number =>
      value === 'P' ? 1 : 0,
    [],
  );

  const toNumberOrZero = useCallback((value: number | null | undefined) => {
    if (value === null || value === undefined || value === '') {
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

  const handleSelectExistingQc = useCallback((record: ProductQcRecord) => {
    setSelectedQcRecord(record);
    setQcListVisible(false);
    setQcModalVisible(true);
  }, []);

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

  const openQCPdfWindow = useCallback((ship: ShipTableRecord, data: any) => {
    if (typeof window === 'undefined') {
      return;
    }

    const win = window.open('', '_blank');
    if (!win) {
      message.error('Popup diblokir. Izinkan popup untuk generate PDF.');
      return;
    }

    const style = `
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, Segoe UI, Roboto, Arial; color: #262626; margin: 24px; }
        .header { display:flex; justify-content: space-between; align-items: center; border-bottom:1px solid #e8e8e8; padding-bottom:12px; margin-bottom:16px; }
        .title { font-size:18px; font-weight:700; color:#111; }
        .meta { font-size:12px; color:#666; }
        .section { margin-top:16px; }
        .section h3 { margin:0 0 8px 0; font-size:14px; color:#111; }
        table { width:100%; border-collapse: collapse; font-size:12px; }
        th, td { border:1px solid #e8e8e8; padding:6px 8px; text-align:center; }
        th { background:#fafafa; font-weight:600; }
        .grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .card { border:1px solid #e8e8e8; border-radius:8px; padding:12px; }
        .muted { color:#666; }
        .kbd { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        @media print {.noprint{ display:none; }}
      </style>
    `;

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

    const rows = (records: any[]) =>
      records
        .map(
          (recordItem, index) => `
          <tr>
            <td><b>${index + 1}</b></td>
            <td>${recordItem.free_water || '-'}</td>
            <td>${recordItem.suspended_water || '-'}</td>
            <td>${formatNumber(recordItem.electrical_conductivity, 0)}</td>
            <td>${formatNumber(recordItem.temperature_observed, 1)}</td>
            <td>${formatNumber(recordItem.density_observed, 4)}</td>
            <td>${formatNumber(recordItem.density_15c, 4)}</td>
            <td>${formatNumber(recordItem.volume_liters, 3)}</td>
            <td>${formatNumber(recordItem.dens_15c_x_volume, 3)}</td>
          </tr>
        `,
        )
        .join('');

    if (!data.__calc && data.calculatedResults) {
      data.__calc = data.calculatedResults;
    }

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Product QC - ${ship.name}</title>
          ${style}
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">PRODUCT QUALITY CHECK – BEFORE DISCHARGE</div>
              <div class="meta">Kapal: <b>${safeText(ship.name)} (${safeText(
                ship.code,
              )})</b> &nbsp;•&nbsp; Muatan: <b>${safeText(
                ship.cargoType,
              )}</b></div>
              <div class="meta">Kedatangan: ${formatDateTime(
                ship.arrivalDate ?? undefined,
              )} &nbsp;•&nbsp; Lokasi: ${safeText(ship.portLocation)}</div>
            </div>
            <div class="muted">Generated at ${new Date().toLocaleString()}</div>
          </div>

          <div class="section grid">
            <div class="card">
              <h3>Informasi Kapal</h3>
              <table>
                <tr><th style="text-align:left;">Nama Kapal</th><td style="text-align:left;">${safeText(
                  ship.name,
                )}</td></tr>
                <tr><th style="text-align:left;">Tanggal Kedatangan</th><td style="text-align:left;">${formatDateTime(
                  ship.arrivalDate ?? undefined,
                )}</td></tr>
                <tr><th style="text-align:left;">Kapasitas</th><td style="text-align:left;">${formatNumber(
                  ship.capacity,
                  0,
                )} KL</td></tr>
                <tr><th style="text-align:left;">Bendera</th><td style="text-align:left;">${safeText(
                  ship.flag,
                )}</td></tr>
                <tr><th style="text-align:left;">Perusahaan</th><td style="text-align:left;">${safeText(
                  ship.company,
                )}</td></tr>
                <tr><th style="text-align:left;">Kapten</th><td style="text-align:left;">${safeText(
                  ship.captainName,
                )}</td></tr>
                <tr><th style="text-align:left;">Pelabuhan Asal</th><td style="text-align:left;">${safeText(
                  ship.originPort,
                )}</td></tr>
                <tr><th style="text-align:left;">Pelabuhan Tujuan</th><td style="text-align:left;">${safeText(
                  ship.destinationPort,
                )}</td></tr>
              </table>
            </div>
            <div class="card">
              <h3>Ringkasan Perhitungan</h3>
              <table>
                <tr><th style="text-align:left;">Total (Dens@15°C × Volume)</th><td style="text-align:left;" class="kbd">${formatNumber(data.__calc?.total_volume_dens_15c ?? '-', 3)}</td></tr>
                <tr><th style="text-align:left;">Total Volume</th><td style="text-align:left;" class="kbd">${formatNumber(data.__calc?.total_volume ?? '-', 3)} L</td></tr>
                <tr><th style="text-align:left;">Expected Density</th><td style="text-align:left;" class="kbd">${formatNumber(data.__calc?.expected_density ?? '-', 1)} kg/m³</td></tr>
                <tr><th style="text-align:left;">Refinery Certificate</th><td style="text-align:left;" class="kbd">${formatNumber(data.__calc?.refinery_certificate_density ?? '-', 0)} kg/m³</td></tr>
                <tr><th style="text-align:left;">Difference (Max 3)</th><td style="text-align:left;" class="kbd">${formatNumber(data.__calc?.density_difference ?? '-', 1)} kg/m³</td></tr>
              </table>
            </div>
          </div>

          <div class="section">
            <h3>Port Compartment</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Free Water</th>
                  <th>Suspended Water</th>
                  <th>EC (µS/m)</th>
                  <th>Temp (°C)</th>
                  <th>Density Obs</th>
                  <th>Density @15°C</th>
                  <th>Volume (L)</th>
                  <th>D15 × V</th>
                </tr>
              </thead>
              <tbody>
                ${rows(data.port_data || [])}
              </tbody>
            </table>
          </div>

          <div class="section" style="page-break-inside: avoid;">
            <h3>Starboard Compartment</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Free Water</th>
                  <th>Suspended Water</th>
                  <th>EC (µS/m)</th>
                  <th>Temp (°C)</th>
                  <th>Density Obs</th>
                  <th>Density @15°C</th>
                  <th>Volume (L)</th>
                  <th>D15 × V</th>
                </tr>
              </thead>
              <tbody>
                ${rows(data.starboard_data || [])}
              </tbody>
            </table>
          </div>

          <div class="section noprint" style="text-align:right; margin-top:16px;">
            <button onclick="window.print()" style="padding:8px 12px; border:1px solid #d9d9d9; background:#fafafa; border-radius:6px; cursor:pointer;">Print / Save as PDF</button>
          </div>
        </body>
      </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();
  }, []);

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
                disabled={!hasLocalQcData}
                onClick={() => {
                  const qcData = qcDataByShip[shipKey];
                  if (!qcData) {
                    message.warning(
                      'Silakan simpan Product QC terlebih dahulu',
                    );
                    return;
                  }
                  openQCPdfWindow(record, qcData);
                }}
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
      openQCPdfWindow,
      qcDataByShip,
      qcAvailabilityByShip,
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
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
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
      </Row>

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
    </PageContainer>
  );
};

export default Ships;
