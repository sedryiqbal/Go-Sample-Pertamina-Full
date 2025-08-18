import {
  CalendarOutlined,
  CarOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
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
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

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
  const [editingRecord, setEditingRecord] = useState<ShipRecord | undefined>();
  const actionRef = useRef<ActionType>();
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
      departure_date: record.departure_date
        ? dayjs(record.departure_date)
        : null,
    });
    setDrawerVisible(true);
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
        departure_date: _values.departure_date?.format('YYYY-MM-DD HH:mm'),
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
      title: 'Keberangkatan',
      dataIndex: 'departure_date',
      key: 'departure_date',
      valueType: 'dateTime',
      render: (_, record) =>
        record.departure_date ? (
          <span>{dayjs(record.departure_date).format('DD/MM/YYYY HH:mm')}</span>
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
      width: 120,
      render: (_, record) => (
        <Space>
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
      ),
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
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Berangkat"
              value={shipSummary.departed}
              prefix={<CarOutlined style={{ color: '#999' }} />}
              valueStyle={{ color: '#999' }}
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

          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
              <Form.Item name="departure_date" label="Tanggal Keberangkatan">
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

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
    </PageContainer>
  );
};

export default Ships;
