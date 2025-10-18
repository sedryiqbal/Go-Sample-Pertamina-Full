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
import ProductQCModal from '@/components/ProductQCModal';
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
import { formatDateTime, safeText, toCreateShipPayload } from './utils';

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

const normalizeSelectParam = (value: unknown): string | undefined => {
  if (Array.isArray(value) && value.length > 0) {
    return normalizeTextParam(value[0]);
  }

  return normalizeTextParam(value);
};

const Ships: React.FC = () => {
  const [form] = Form.useForm<ShipFormValues>();
  const actionRef = useRef<ActionType | null>(null);

  const { summary, loading, creating, createShip, setShips, loadShips } =
    useShipManagement();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingShip, setEditingShip] = useState<ShipTableRecord | null>(null);
  const [qcModalVisible, setQcModalVisible] = useState(false);
  const [qcShip, setQcShip] = useState<ShipTableRecord | null>(null);
  const [qcDataByShip, setQcDataByShip] = useState<Record<string, any>>({});
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailShip, setDetailShip] = useState<ShipTableRecord | null>(null);

  const handleTableRequest = useCallback(
    async (params: Record<string, any>) => {
      const {
        current = 1,
        pageSize = 10,
        name,
        type,
        status,
        arrivalDateRange,
      } = params ?? {};

      let arrivalDateFrom: string | undefined;
      let arrivalDateTo: string | undefined;

      if (Array.isArray(arrivalDateRange) && arrivalDateRange.length === 2) {
        const [from, to] = arrivalDateRange;
        const start = dayjs(from);
        const end = dayjs(to);
        if (start.isValid()) {
          arrivalDateFrom = start.startOf('day').toISOString();
        }
        if (end.isValid()) {
          arrivalDateTo = end.endOf('day').toISOString();
        }
      }

      return loadShips({
        page: Number(current) || 1,
        pageSize: Number(pageSize) || 10,
        name: normalizeTextParam(name),
        type: normalizeSelectParam(type),
        status: normalizeSelectParam(status),
        arrivalDateFrom,
        arrivalDateTo,
      });
    },
    [loadShips],
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
        type: record.type ?? undefined,
        flag: record.flag ?? undefined,
        company: record.company ?? undefined,
        captainName: record.captainName ?? undefined,
        capacity: record.capacity ?? undefined,
        cargoType: record.cargoType ?? undefined,
        arrivalDate: record.arrivalDate ? dayjs(record.arrivalDate) : undefined,
        operationCompletionTime: record.operationCompletionTime
          ? dayjs(record.operationCompletionTime)
          : undefined,
        portLocation: record.portLocation ?? undefined,
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
        onOk: () => {
          setShips((prev) => prev.filter((ship) => ship.id !== record.id));
          message.success(`Data kapal ${record.name} berhasil dihapus`);
        },
      });
    },
    [setShips],
  );

  const handleOpenQC = useCallback((record: ShipTableRecord) => {
    setQcShip(record);
    setQcModalVisible(true);
  }, []);

  const handleShowDetail = useCallback((record: ShipTableRecord) => {
    setDetailShip(record);
    setDetailVisible(true);
  }, []);

  const handleSubmitQC = useCallback(
    (data: any) => {
      if (!qcShip) {
        return;
      }

      setQcDataByShip((prev) => ({ ...prev, [qcShip.id]: data }));
      message.success('Product QC untuk kapal berhasil disimpan');
      setQcModalVisible(false);
      setQcShip(null);
    },
    [qcShip],
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

  const handleDrawerClose = useCallback(() => {
    setDrawerVisible(false);
    setEditingShip(null);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(
    async (values: ShipFormValues) => {
      if (editingShip) {
        const payload = toCreateShipPayload(values);
        setShips((prev) =>
          prev.map((ship) =>
            ship.id === editingShip.id ? { ...ship, ...payload } : ship,
          ),
        );
        message.success('Data kapal berhasil diperbarui');
        handleDrawerClose();
        return;
      }

      try {
        const createdShip = await createShip(values);
        setShips((prev) => [createdShip, ...prev]);
        handleDrawerClose();
        actionRef.current?.setPageInfo?.({ current: 1 });
        actionRef.current?.reload();
      } catch (_error) {
        // Error notification already ditangani oleh hook.
      }
    },
    [createShip, editingShip, handleDrawerClose, setShips],
  );

  const columns = useMemo<ProColumns<ShipTableRecord>[]>(
    () => [
      {
        title: 'Nama Kapal',
        dataIndex: 'name',
        key: 'name',
        width: 240,
        fixed: 'left',
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
        title: 'Rentang Kedatangan',
        dataIndex: 'arrivalDateRange',
        valueType: 'dateRange',
        hideInTable: true,
      },
      {
        title: 'Tipe Kapal',
        dataIndex: 'type',
        key: 'type',
        valueType: 'select',
        width: 140,
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
        title: 'Lokasi Pelabuhan',
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
        title: 'Aksi',
        key: 'actions',
        width: 420,
        hideInSearch: true,
        render: (_, record) => {
          const hasQC = !!qcDataByShip[record.id];
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
                onClick={() => handleDelete(record)}
              >
                Hapus
              </Button>
              <Button
                size="small"
                type={hasQC ? 'default' : 'primary'}
                icon={<FileDoneOutlined />}
                onClick={() => handleOpenQC(record)}
                style={{ borderRadius: 16 }}
              >
                Product QC
              </Button>
              <Button
                size="small"
                icon={<FileTextOutlined />}
                disabled={!hasQC}
                onClick={() => {
                  const qcData = qcDataByShip[record.id];
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
        submitting={creating && !editingShip}
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

      <ProductQCModal
        visible={qcModalVisible}
        onClose={() => {
          setQcModalVisible(false);
          setQcShip(null);
        }}
        sampleData={
          qcShip
            ? {
                vessel_name: qcShip.name,
                sample_type: qcShip.cargoType,
              }
            : undefined
        }
        onSubmit={handleSubmitQC}
      />
    </PageContainer>
  );
};

export default Ships;
