import {
  CalendarOutlined,
  CarOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
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
  DatePicker,
  Drawer,
  Form,
  Input,
  Modal,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import ProductQCModal from '../../components/ProductQCModal';

interface ShipRecord {
  id: string;
  vessel_name: string;
  vessel_code: string;
  vessel_type: 'tanker' | 'cargo' | 'container' | 'bulk_carrier';
  flag: string;
  company: string;
  captain_name: string;
  capacity: number;
  arrival_date: string;
  departure_date?: string;
  completed_time?: string;
  berth_location: string;
  cargo_type: string;
  status: 'approaching' | 'berthed' | 'loading' | 'unloading' | 'departed';
  contact_person: string;
  phone: string;
  email: string;
  notes?: string;
  last_port: string;
  next_port: string;
  created_at: string;
}

const Ships: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [qcModalVisible, setQcModalVisible] = useState(false);
  const [qcShip, setQcShip] = useState<ShipRecord | null>(null);
  const [qcDataByShip, setQcDataByShip] = useState<Record<string, any>>({});
  const [editingRecord, setEditingRecord] = useState<ShipRecord | undefined>();
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();

  const vesselTypeOptions = [
    { label: 'Tanker', value: 'tanker' },
    { label: 'Cargo', value: 'cargo' },
    { label: 'Container', value: 'container' },
    { label: 'Bulk Carrier', value: 'bulk_carrier' },
  ];

  const statusOptions = [
    { label: 'Approaching', value: 'approaching' },
    { label: 'Berthed', value: 'berthed' },
    { label: 'Loading', value: 'loading' },
    { label: 'Unloading', value: 'unloading' },
    { label: 'Departed', value: 'departed' },
  ];

  const cargoTypeOptions = [
    { label: 'JET A-1', value: 'jet-a1' },
    { label: 'Avgas', value: 'avgas' },
    { label: 'Diesel', value: 'diesel' },
    { label: 'Gasoline', value: 'gasoline' },
    { label: 'Crude Oil', value: 'crude_oil' },
    { label: 'Chemicals', value: 'chemicals' },
  ];

  const berthLocationOptions = [
    { label: 'Berth 1A - Soekarno-Hatta', value: 'berth_1a' },
    { label: 'Berth 1B - Soekarno-Hatta', value: 'berth_1b' },
    { label: 'Berth 2A - Soekarno-Hatta', value: 'berth_2a' },
    { label: 'Berth 2B - Soekarno-Hatta', value: 'berth_2b' },
    { label: 'Anchorage Area', value: 'anchorage' },
  ];

  const handleAdd = () => {
    setEditingRecord(undefined);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: ShipRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      arrival_date: record.arrival_date ? dayjs(record.arrival_date) : null,
      completed_time: record.completed_time
        ? dayjs(record.completed_time)
        : null,
    });
    setDrawerVisible(true);
  };

  const handleOpenQC = (record: ShipRecord) => {
    setQcShip(record);
    setQcModalVisible(true);
  };

  const handleSubmitQC = (data: any) => {
    if (!qcShip) return;
    setQcDataByShip((prev) => ({ ...prev, [qcShip.id]: data }));
    message.success('Product QC untuk kapal berhasil disimpan');
    setQcModalVisible(false);
    setQcShip(null);
  };

  const openQCPdfWindow = (ship: ShipRecord, data: any) => {
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

    const formatNumber = (v: any, d = 3) =>
      (v ?? '-') === '-'
        ? '-'
        : Number(v).toLocaleString(undefined, { maximumFractionDigits: d });

    const rows = (records: any[]) =>
      records
        .map(
          (r, i) => `
          <tr>
            <td><b>${i + 1}</b></td>
            <td>${r.free_water || '-'}</td>
            <td>${r.suspended_water || '-'}</td>
            <td>${formatNumber(r.electrical_conductivity, 0)}</td>
            <td>${formatNumber(r.temperature_observed, 1)}</td>
            <td>${formatNumber(r.density_observed, 4)}</td>
            <td>${formatNumber(r.density_15c, 4)}</td>
            <td>${formatNumber(r.volume_liters, 3)}</td>
            <td>${formatNumber(r.dens_15c_x_volume, 3)}</td>
          </tr>
        `,
        )
        .join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Product QC - ${ship.vessel_name}</title>
          ${style}
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">PRODUCT QUALITY CHECK – BEFORE DISCHARGE</div>
              <div class="meta">Kapal: <b>${ship.vessel_name} (${ship.vessel_code})</b> &nbsp;•&nbsp; Muatan: <b>${ship.cargo_type}</b></div>
              <div class="meta">Kedatangan: ${ship.arrival_date || '-'} &nbsp;•&nbsp; Lokasi: ${ship.berth_location}</div>
            </div>
            <div class="muted">Generated at ${new Date().toLocaleString()}</div>
          </div>

          <div class="section grid">
            <div class="card">
              <h3>Informasi Tanker</h3>
              <table>
                <tr><th style="text-align:left;">Name of Tanker</th><td style="text-align:left;">${data.name_of_tanker}</td></tr>
                <tr><th style="text-align:left;">Arrival Date</th><td style="text-align:left;">${data.arrival_date}</td></tr>
                <tr><th style="text-align:left;">Quantity in Batch</th><td style="text-align:left;">${formatNumber(data.quantity_in_batch, 0)} L</td></tr>
                <tr><th style="text-align:left;">Voyage No.</th><td style="text-align:left;">${data.voyage_no}</td></tr>
                <tr><th style="text-align:left;">RCoQ No.</th><td style="text-align:left;">${data.rcoq_no}</td></tr>
                <tr><th style="text-align:left;">RCoQ Date</th><td style="text-align:left;">${data.rcoq_date}</td></tr>
                <tr><th style="text-align:left;">Refinery/Terminal</th><td style="text-align:left;">${data.refinery_terminal}</td></tr>
                <tr><th style="text-align:left;">Grade of Product</th><td style="text-align:left;">${data.grade_of_product}</td></tr>
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

    // attach simple calc summary if available
    if (!data.__calc && data.calculatedResults) {
      data.__calc = data.calculatedResults;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const handleDelete = (record: ShipRecord) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus',
      content: `Apakah Anda yakin ingin menghapus data kapal ${record.vessel_name}?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk() {
        message.success(`Data kapal ${record.vessel_name} berhasil dihapus`);
        actionRef.current?.reload();
      },
    });
  };

  const handleSubmit = async (_values: any) => {
    try {
      const _formattedValues = {
        ..._values,
        arrival_date: _values.arrival_date?.format('YYYY-MM-DD HH:mm'),
        completed_time: _values.completed_time?.format('YYYY-MM-DD HH:mm'),
      };

      if (editingRecord) {
        message.success('Data kapal berhasil diperbarui');
      } else {
        message.success('Data kapal berhasil ditambahkan');
      }
      setDrawerVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan data kapal');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approaching':
        return 'processing';
      case 'berthed':
        return 'success';
      case 'loading':
        return 'warning';
      case 'unloading':
        return 'warning';
      case 'departed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approaching':
        return 'Mendekat';
      case 'berthed':
        return 'Berlabuh';
      case 'loading':
        return 'Loading';
      case 'unloading':
        return 'Unloading';
      case 'departed':
        return 'Berangkat';
      default:
        return status;
    }
  };

  const getVesselTypeColor = (type: string) => {
    switch (type) {
      case 'tanker':
        return 'blue';
      case 'cargo':
        return 'green';
      case 'container':
        return 'orange';
      case 'bulk_carrier':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getVesselTypeLabel = (type: string) => {
    switch (type) {
      case 'tanker':
        return 'Tanker';
      case 'cargo':
        return 'Cargo';
      case 'container':
        return 'Container';
      case 'bulk_carrier':
        return 'Bulk Carrier';
      default:
        return type;
    }
  };

  const columns: ProColumns<ShipRecord>[] = [
    {
      title: 'Nama Kapal',
      dataIndex: 'vessel_name',
      key: 'vessel_name',
      render: (_, record) => (
        <Space>
          <CarOutlined style={{ color: '#fd0017' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.vessel_name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.vessel_code}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Product QC',
      key: 'qc_status',
      width: 130,
      render: (_, record) => {
        const hasQC = !!qcDataByShip[record.id];
        return (
          <Badge
            status={hasQC ? 'success' : 'default'}
            text={hasQC ? 'QC Done' : 'Not Yet'}
          />
        );
      },
    },
    {
      title: 'Tipe Kapal',
      dataIndex: 'vessel_type',
      key: 'vessel_type',
      render: (_, record) => (
        <Tag color={getVesselTypeColor(record.vessel_type)}>
          {getVesselTypeLabel(record.vessel_type)}
        </Tag>
      ),
      filters: vesselTypeOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Perusahaan',
      dataIndex: 'company',
      key: 'company',
      ellipsis: true,
    },
    {
      title: 'Muatan',
      dataIndex: 'cargo_type',
      key: 'cargo_type',
      render: (_, record) => <Tag color="cyan">{record.cargo_type}</Tag>,
    },
    {
      title: 'Kedatangan',
      dataIndex: 'arrival_date',
      key: 'arrival_date',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: 'Waktu Selesai',
      dataIndex: 'completed_time',
      key: 'completed_time',
      valueType: 'dateTime',
      sorter: true,
      render: (_, record) =>
        record.completed_time ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ color: '#52c41a', marginRight: 4 }} />
            <span>
              {dayjs(record.completed_time).format('DD/MM/YYYY HH:mm')}
            </span>
          </div>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },

    {
      title: 'Lokasi Dermaga',
      dataIndex: 'berth_location',
      key: 'berth_location',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EnvironmentOutlined style={{ color: '#fd0017', marginRight: 4 }} />
          <span>{record.berth_location}</span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <Badge
          status={getStatusColor(record.status)}
          text={getStatusLabel(record.status)}
        />
      ),
      filters: statusOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Kontak',
      dataIndex: 'contact_person',
      key: 'contact_person',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.contact_person}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 320,
      render: (_, record) => {
        const hasQC = !!qcDataByShip[record.id];
        return (
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Space size={4}>
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
            </Space>
            <Space size={4}>
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
                  const data = qcDataByShip[record.id];
                  if (!data) {
                    message.warning(
                      'Silakan simpan Product QC terlebih dahulu',
                    );
                    return;
                  }
                  openQCPdfWindow(record, data);
                }}
                style={{ borderRadius: 16 }}
              >
                PDF
              </Button>
            </Space>
          </div>
        );
      },
    },
  ];

  const mockData: ShipRecord[] = [
    {
      id: '1',
      vessel_name: 'MT. Commodore One',
      vessel_code: 'CMO001',
      vessel_type: 'tanker',
      flag: 'Singapore',
      company: 'Maritime Oil Corp',
      captain_name: 'Captain Johnson',
      capacity: 50000,
      arrival_date: '2025-08-05 08:00',
      departure_date: '2025-08-07 16:00',
      completed_time: '2025-08-07 14:30',
      berth_location: 'Berth 1A - Soekarno-Hatta',
      cargo_type: 'JET A-1',
      status: 'unloading',
      contact_person: 'John Smith',
      phone: '+65-98765432',
      email: 'john.smith@maritime.com',
      last_port: 'Singapore',
      next_port: 'Batam',
      created_at: '2025-08-01',
    },
    {
      id: '2',
      vessel_name: 'MT. Pioneer',
      vessel_code: 'PIO002',
      vessel_type: 'tanker',
      flag: 'Malaysia',
      company: 'Southeast Shipping',
      captain_name: 'Captain Ahmad',
      capacity: 35000,
      arrival_date: '2025-08-06 14:00',
      completed_time: '2025-08-08 10:15',
      berth_location: 'Berth 2A - Soekarno-Hatta',
      cargo_type: 'Avgas',
      status: 'berthed',
      contact_person: 'Ahmad Rahman',
      phone: '+60-12345678',
      email: 'ahmad@southeast.com',
      last_port: 'Port Klang',
      next_port: 'Surabaya',
      created_at: '2025-08-02',
    },
    {
      id: '3',
      vessel_name: 'MV. Explorer',
      vessel_code: 'EXP003',
      vessel_type: 'cargo',
      flag: 'Indonesia',
      company: 'Nusantara Shipping',
      captain_name: 'Captain Budi',
      capacity: 25000,
      arrival_date: '2025-08-08 10:00',
      berth_location: 'Anchorage Area',
      cargo_type: 'Diesel',
      status: 'approaching',
      contact_person: 'Budi Santoso',
      phone: '+62-81234567890',
      email: 'budi@nusantara.co.id',
      last_port: 'Balikpapan',
      next_port: 'Makassar',
      created_at: '2025-08-03',
    },
  ];

  const shipSummary = {
    total: mockData.length,
    berthed: mockData.filter((item) =>
      ['berthed', 'loading', 'unloading'].includes(item.status),
    ).length,
    approaching: mockData.filter((item) => item.status === 'approaching')
      .length,
    departed: mockData.filter((item) => item.status === 'departed').length,
  };

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
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Kapal"
              value={shipSummary.total}
              prefix={<CarOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Berlabuh"
              value={shipSummary.berthed}
              prefix={<EnvironmentOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Mendekat"
              value={shipSummary.approaching}
              prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <ProTable<ShipRecord>
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        columns={columns}
        dataSource={mockData}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="Daftar Kapal"
        toolBarRender={() => [
          <Button key="export" type="default">
            Export Excel
          </Button>,
          <Button key="schedule" type="default">
            Jadwal Kedatangan
          </Button>,
        ]}
      />

      <Drawer
        title={editingRecord ? 'Edit Data Kapal' : 'Tambah Data Kapal Baru'}
        width={700}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
        }}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Batal</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
            >
              Simpan
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="vessel_name"
                label="Nama Kapal"
                rules={[{ required: true, message: 'Nama kapal wajib diisi' }]}
              >
                <Input placeholder="MT. Commodore One" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="vessel_code"
                label="Kode Kapal"
                rules={[{ required: true, message: 'Kode kapal wajib diisi' }]}
              >
                <Input placeholder="CMO001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vessel_type"
                label="Tipe Kapal"
                rules={[
                  { required: true, message: 'Tipe kapal wajib dipilih' },
                ]}
              >
                <Select
                  placeholder="Pilih tipe kapal"
                  options={vesselTypeOptions}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="flag"
                label="Bendera"
                rules={[{ required: true, message: 'Bendera wajib diisi' }]}
              >
                <Input placeholder="Singapore" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="company"
                label="Perusahaan"
                rules={[{ required: true, message: 'Perusahaan wajib diisi' }]}
              >
                <Input placeholder="Maritime Oil Corp" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="captain_name"
                label="Nama Kapten"
                rules={[{ required: true, message: 'Nama kapten wajib diisi' }]}
              >
                <Input placeholder="Captain Johnson" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Kapasitas (MT)"
                rules={[{ required: true, message: 'Kapasitas wajib diisi' }]}
              >
                <Input type="number" placeholder="50000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cargo_type"
                label="Jenis Muatan"
                rules={[
                  { required: true, message: 'Jenis muatan wajib dipilih' },
                ]}
              >
                <Select
                  placeholder="Pilih jenis muatan"
                  options={cargoTypeOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="arrival_date"
            label="Tanggal Kedatangan"
            rules={[
              { required: true, message: 'Tanggal kedatangan wajib diisi' },
            ]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="completed_time"
            label="Waktu Selesai Operasi"
            tooltip="Waktu penyelesaian loading/unloading atau operasi lainnya"
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Pilih waktu selesai operasi"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="berth_location"
                label="Lokasi Dermaga"
                rules={[
                  { required: true, message: 'Lokasi dermaga wajib dipilih' },
                ]}
              >
                <Select
                  placeholder="Pilih lokasi dermaga"
                  options={berthLocationOptions}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Status wajib dipilih' }]}
              >
                <Select placeholder="Pilih status" options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="contact_person"
                label="Contact Person"
                rules={[
                  { required: true, message: 'Contact person wajib diisi' },
                ]}
              >
                <Input placeholder="John Smith" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="phone"
                label="Telepon"
                rules={[{ required: true, message: 'Telepon wajib diisi' }]}
              >
                <Input placeholder="+65-98765432" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email wajib diisi' },
                  { type: 'email', message: 'Format email tidak valid' },
                ]}
              >
                <Input placeholder="contact@company.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="last_port" label="Pelabuhan Asal">
                <Input placeholder="Singapore" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="next_port" label="Pelabuhan Tujuan">
                <Input placeholder="Batam" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Catatan">
            <Input.TextArea
              rows={3}
              placeholder="Catatan tambahan mengenai kapal..."
            />
          </Form.Item>
        </Form>
      </Drawer>
      <ProductQCModal
        visible={qcModalVisible}
        onClose={() => {
          setQcModalVisible(false);
          setQcShip(null);
        }}
        sampleData={
          qcShip
            ? {
                vessel_name: qcShip.vessel_name,
                sample_type: qcShip.cargo_type,
              }
            : undefined
        }
        onSubmit={handleSubmitQC}
      />
    </PageContainer>
  );
};

export default Ships;
