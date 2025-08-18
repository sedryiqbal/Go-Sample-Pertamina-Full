import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Tag,
} from 'antd';
import React, { useRef, useState } from 'react';

interface LaboratoryRecord {
  id: string;
  lab_name: string;
  lab_code: string;
  lab_type: 'internal' | 'external' | 'partner';
  location: string;
  city: string;
  address: string;
  estimated_time: number; // in hours
  contact_person: string;
  phone: string;
  email: string;
  capabilities: string[];
  certification: string[];
  capacity_per_day: number;
  current_workload: number;
  status: 'active' | 'inactive' | 'maintenance';
  operating_hours: string;
  specialization: string[];
  created_at: string;
  notes?: string;
}

const Laboratories: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<
    LaboratoryRecord | undefined
  >();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();

  const labTypeOptions = [
    { label: 'Internal', value: 'internal' },
    { label: 'External', value: 'external' },
    { label: 'Partner', value: 'partner' },
  ];

  const capabilityOptions = [
    { label: 'Kadar Air', value: 'water_content' },
    { label: 'Viskositas', value: 'viscosity' },
    { label: 'Densitas', value: 'density' },
    { label: 'Flash Point', value: 'flash_point' },
    { label: 'Freeze Point', value: 'freeze_point' },
    { label: 'Sulfur Content', value: 'sulfur_content' },
    { label: 'Aromatics', value: 'aromatics' },
    { label: 'Cetane Index', value: 'cetane_index' },
    { label: 'Octane Number', value: 'octane_number' },
    { label: 'Thermal Stability', value: 'thermal_stability' },
    { label: 'Distillation', value: 'distillation' },
    { label: 'Corrosion', value: 'corrosion' },
  ];

  const certificationOptions = [
    { label: 'ISO 17025', value: 'iso_17025' },
    { label: 'ISO 9001', value: 'iso_9001' },
    { label: 'ASTM International', value: 'astm' },
    { label: 'API Certification', value: 'api' },
    { label: 'DEF STAN', value: 'def_stan' },
    { label: 'Local Certification', value: 'local' },
  ];

  const specializationOptions = [
    { label: 'Aviation Fuel', value: 'aviation_fuel' },
    { label: 'Marine Fuel', value: 'marine_fuel' },
    { label: 'Automotive Fuel', value: 'automotive_fuel' },
    { label: 'Lubricants', value: 'lubricants' },
    { label: 'Chemicals', value: 'chemicals' },
    { label: 'Crude Oil', value: 'crude_oil' },
  ];

  const cityOptions = [
    { label: 'Jakarta', value: 'jakarta' },
    { label: 'Priok', value: 'priok' },
    { label: 'Balongan', value: 'balongan' },
    { label: 'Surabaya', value: 'surabaya' },
    { label: 'Balikpapan', value: 'balikpapan' },
    { label: 'Medan', value: 'medan' },
  ];

  const handleAdd = () => {
    setEditingRecord(undefined);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: LaboratoryRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setDrawerVisible(true);
  };

  const handleDelete = (record: LaboratoryRecord) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus',
      content: `Apakah Anda yakin ingin menghapus laboratorium ${record.lab_name}?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk() {
        message.success(`Laboratorium ${record.lab_name} berhasil dihapus`);
        actionRef.current?.reload();
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord) {
        message.success('Data laboratorium berhasil diperbarui');
      } else {
        message.success('Data laboratorium berhasil ditambahkan');
      }
      setDrawerVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      message.error('Gagal menyimpan data laboratorium');
    }
  };

  const getLabTypeColor = (type: string) => {
    switch (type) {
      case 'internal':
        return 'green';
      case 'external':
        return 'blue';
      case 'partner':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getLabTypeLabel = (type: string) => {
    switch (type) {
      case 'internal':
        return 'Internal';
      case 'external':
        return 'External';
      case 'partner':
        return 'Partner';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Tidak Aktif';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };

  const getWorkloadColor = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  const columns: ProColumns<LaboratoryRecord>[] = [
    {
      title: 'Nama Laboratorium',
      dataIndex: 'lab_name',
      key: 'lab_name',
      render: (_, record) => (
        <Space>
          <ExperimentOutlined style={{ color: '#fd0017' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.lab_name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.lab_code}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tipe',
      dataIndex: 'lab_type',
      key: 'lab_type',
      render: (_, record) => (
        <Tag color={getLabTypeColor(record.lab_type)}>
          {getLabTypeLabel(record.lab_type)}
        </Tag>
      ),
      filters: labTypeOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Lokasi & Estimasi Waktu',
      dataIndex: 'location',
      key: 'location',
      render: (_, record) => (
        <div>
          <div
            style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}
          >
            <EnvironmentOutlined style={{ color: '#fd0017', marginRight: 4 }} />
            <span style={{ fontWeight: 500 }}>
              {record.location} - {record.city}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ClockCircleOutlined
              style={{ color: '#9fe400', marginRight: 4, fontSize: '12px' }}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {record.estimated_time} jam
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Kapasitas Harian',
      dataIndex: 'capacity_per_day',
      key: 'capacity_per_day',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.current_workload}/{record.capacity_per_day}
          </div>
          <Badge
            status={getWorkloadColor(
              record.current_workload,
              record.capacity_per_day,
            )}
            text={`${Math.round((record.current_workload / record.capacity_per_day) * 100)}%`}
          />
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Spesialisasi',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (_, record) => (
        <div>
          {record.specialization.slice(0, 2).map((spec) => (
            <Tag key={spec} size="small" style={{ marginBottom: 2 }}>
              {specializationOptions.find((opt) => opt.value === spec)?.label ||
                spec}
            </Tag>
          ))}
          {record.specialization.length > 2 && (
            <Tag size="small" color="default">
              +{record.specialization.length - 2}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Sertifikasi',
      dataIndex: 'certification',
      key: 'certification',
      render: (_, record) => (
        <div>
          {record.certification.slice(0, 2).map((cert) => (
            <Tag
              key={cert}
              size="small"
              color="cyan"
              style={{ marginBottom: 2 }}
            >
              {certificationOptions.find((opt) => opt.value === cert)?.label ||
                cert}
            </Tag>
          ))}
          {record.certification.length > 2 && (
            <Tag size="small" color="default">
              +{record.certification.length - 2}
            </Tag>
          )}
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
      filters: [
        { text: 'Aktif', value: 'active' },
        { text: 'Tidak Aktif', value: 'inactive' },
        { text: 'Maintenance', value: 'maintenance' },
      ],
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

  const mockData: LaboratoryRecord[] = [
    {
      id: '1',
      lab_name: 'LPUJ - Lembaga Pengujian Ujicoba',
      lab_code: 'LPUJ',
      lab_type: 'external',
      location: 'Tanjung Priok',
      city: 'Jakarta',
      address: 'Jl. Raya Pelabuhan No. 123, Tanjung Priok',
      estimated_time: 1,
      contact_person: 'Dr. Ahmad Laboratorium',
      phone: '+62-21-12345678',
      email: 'ahmad@lpuj.co.id',
      capabilities: [
        'water_content',
        'viscosity',
        'density',
        'flash_point',
        'freeze_point',
      ],
      certification: ['iso_17025', 'astm', 'api'],
      capacity_per_day: 50,
      current_workload: 35,
      status: 'active',
      operating_hours: '07:00 - 17:00',
      specialization: ['aviation_fuel', 'marine_fuel'],
      created_at: '2025-07-01',
      notes: 'Lab eksternal dengan sertifikasi lengkap untuk aviation fuel',
    },
    {
      id: '2',
      lab_name: 'Lemigas - Lembaga Minyak dan Gas Bumi',
      lab_code: 'LMG',
      lab_type: 'partner',
      location: 'Kemayoran',
      city: 'Jakarta',
      address: 'Jl. Ciledug Raya Kav. 109, Jakarta Selatan',
      estimated_time: 1,
      contact_person: 'Ir. Budi Santoso',
      phone: '+62-21-87654321',
      email: 'budi@lemigas.esdm.go.id',
      capabilities: [
        'sulfur_content',
        'aromatics',
        'distillation',
        'octane_number',
        'cetane_index',
      ],
      certification: ['iso_17025', 'iso_9001', 'astm'],
      capacity_per_day: 40,
      current_workload: 28,
      status: 'active',
      operating_hours: '08:00 - 16:00',
      specialization: ['automotive_fuel', 'crude_oil', 'chemicals'],
      created_at: '2025-07-01',
      notes: 'Lab partner pemerintah dengan expertise dalam petroleum products',
    },
    {
      id: '3',
      lab_name: 'Balongan Testing Center',
      lab_code: 'BTC',
      lab_type: 'internal',
      location: 'Balongan',
      city: 'Indramayu',
      address: 'Kompleks Kilang Balongan, Indramayu',
      estimated_time: 6,
      contact_person: 'Drs. Cahaya Wijaya',
      phone: '+62-234-12345678',
      email: 'cahaya@pertamina.com',
      capabilities: [
        'thermal_stability',
        'corrosion',
        'viscosity',
        'density',
        'flash_point',
      ],
      certification: ['iso_17025', 'api', 'def_stan'],
      capacity_per_day: 30,
      current_workload: 15,
      status: 'active',
      operating_hours: '06:00 - 18:00',
      specialization: ['lubricants', 'aviation_fuel'],
      created_at: '2025-07-01',
      notes: 'Lab internal Pertamina dengan fasilitas lengkap',
    },
  ];

  const labSummary = {
    total: mockData.length,
    active: mockData.filter((item) => item.status === 'active').length,
    totalCapacity: mockData.reduce(
      (sum, item) => sum + item.capacity_per_day,
      0,
    ),
    currentWorkload: mockData.reduce(
      (sum, item) => sum + item.current_workload,
      0,
    ),
    averageTime: Math.round(
      mockData.reduce((sum, item) => sum + item.estimated_time, 0) /
        mockData.length,
    ),
  };

  return (
    <PageContainer
      title="Manajemen Laboratorium"
      content="Kelola data laboratorium dengan lokasi, estimasi waktu, dan kapasitas pengujian"
      extra={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          Tambah Laboratorium
        </Button>,
      ]}
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Lab"
              value={labSummary.total}
              prefix={<ExperimentOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Lab Aktif"
              value={labSummary.active}
              prefix={<ExperimentOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Kapasitas Harian"
              value={labSummary.currentWorkload}
              suffix={`/ ${labSummary.totalCapacity}`}
              prefix={<ClockCircleOutlined style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Rata-rata Waktu"
              value={labSummary.averageTime}
              suffix="jam"
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <ProTable<LaboratoryRecord>
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
        headerTitle="Daftar Laboratorium"
        toolBarRender={() => [
          <Button key="export" type="default">
            Export Excel
          </Button>,
          <Button key="capacity" type="default">
            Monitoring Kapasitas
          </Button>,
        ]}
      />

      <Drawer
        title={
          editingRecord
            ? 'Edit Data Laboratorium'
            : 'Tambah Data Laboratorium Baru'
        }
        width={800}
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
                name="lab_name"
                label="Nama Laboratorium"
                rules={[
                  { required: true, message: 'Nama laboratorium wajib diisi' },
                ]}
              >
                <Input placeholder="LPUJ - Lembaga Pengujian Ujicoba" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lab_code"
                label="Kode Lab"
                rules={[{ required: true, message: 'Kode lab wajib diisi' }]}
              >
                <Input placeholder="LPUJ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="lab_type"
                label="Tipe Lab"
                rules={[{ required: true, message: 'Tipe lab wajib dipilih' }]}
              >
                <Select placeholder="Pilih tipe lab" options={labTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="city"
                label="Kota"
                rules={[{ required: true, message: 'Kota wajib dipilih' }]}
              >
                <Select placeholder="Pilih kota" options={cityOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="estimated_time"
                label="Estimasi Waktu (jam)"
                rules={[
                  { required: true, message: 'Estimasi waktu wajib diisi' },
                ]}
              >
                <InputNumber
                  min={0}
                  max={24}
                  placeholder="1"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Lokasi"
            rules={[{ required: true, message: 'Lokasi wajib diisi' }]}
          >
            <Input placeholder="Tanjung Priok" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Alamat Lengkap"
            rules={[{ required: true, message: 'Alamat lengkap wajib diisi' }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Jl. Raya Pelabuhan No. 123, Tanjung Priok"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="contact_person"
                label="Contact Person"
                rules={[
                  { required: true, message: 'Contact person wajib diisi' },
                ]}
              >
                <Input placeholder="Dr. Ahmad Laboratorium" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="phone"
                label="Telepon"
                rules={[{ required: true, message: 'Telepon wajib diisi' }]}
              >
                <Input placeholder="+62-21-12345678" />
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
                <Input placeholder="contact@lab.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="capacity_per_day"
                label="Kapasitas per Hari"
                rules={[
                  { required: true, message: 'Kapasitas per hari wajib diisi' },
                ]}
              >
                <InputNumber
                  min={1}
                  placeholder="50"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="operating_hours"
                label="Jam Operasional"
                rules={[
                  { required: true, message: 'Jam operasional wajib diisi' },
                ]}
              >
                <Input placeholder="07:00 - 17:00" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="capabilities"
            label="Kemampuan Pengujian"
            rules={[
              { required: true, message: 'Kemampuan pengujian wajib dipilih' },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Pilih kemampuan pengujian"
              options={capabilityOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="specialization"
            label="Spesialisasi"
            rules={[{ required: true, message: 'Spesialisasi wajib dipilih' }]}
          >
            <Select
              mode="multiple"
              placeholder="Pilih spesialisasi"
              options={specializationOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="certification"
            label="Sertifikasi"
            rules={[{ required: true, message: 'Sertifikasi wajib dipilih' }]}
          >
            <Select
              mode="multiple"
              placeholder="Pilih sertifikasi"
              options={certificationOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Status wajib dipilih' }]}
          >
            <Select placeholder="Pilih status">
              <Select.Option value="active">Aktif</Select.Option>
              <Select.Option value="inactive">Tidak Aktif</Select.Option>
              <Select.Option value="maintenance">Maintenance</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Catatan">
            <Input.TextArea
              rows={3}
              placeholder="Catatan tambahan mengenai laboratorium..."
            />
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default Laboratories;
