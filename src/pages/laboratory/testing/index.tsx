import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  EditOutlined,
  ExperimentOutlined,
  EyeOutlined,
  FileTextOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type {
  ActionType as ProActionType,
  ProColumns,
} from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { history } from 'umi';
import type { ActionType as LabActionType } from '@/components/LaboratoryActionModal';
import LaboratoryActionModal from '@/components/LaboratoryActionModal';
import SiringManagement, {
  type SiringData,
} from '@/components/SiringManagement';

interface TestingRecord {
  id: string;
  sample_id: string;
  order_number: string;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  received_date: string;
  testing_status:
    | 'received'
    | 'registered'
    | 'testing'
    | 'waiting_equipment'
    | 'completed'
    | 'failed';
  lab_technician: string;
  equipment_used?: string;
  test_parameters: string[];
  test_results: { [key: string]: any };
  progress_percentage: number;
  priority: 'normal' | 'urgent' | 'critical';
  estimated_completion: string;
  actual_completion?: string;
  quality_notes?: string;
  created_at: string;
  updated_at: string;
}

const LaboratoryTesting: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<
    TestingRecord | undefined
  >();
  const [editingRecord, setEditingRecord] = useState<
    TestingRecord | undefined
  >();

  // New state for action modal and siring management
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [currentActionType, setCurrentActionType] =
    useState<LabActionType>('confirm_sample');
  const [siringModalVisible, setSiringModalVisible] = useState(false);
  const [selectedSiring, setSelectedSiring] = useState<
    SiringData | undefined
  >();

  const actionRef = useRef<ProActionType>(null);
  const [form] = Form.useForm();

  const testingStatusOptions = [
    { label: 'Received', value: 'received' },
    { label: 'Registered', value: 'registered' },
    { label: 'Testing', value: 'testing' },
    { label: 'Waiting Equipment', value: 'waiting_equipment' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
  ];

  const labTechnicianOptions = [
    { label: 'Dr. Ahmad Laboratorium', value: 'ahmad-lab' },
    { label: 'Ir. Budi Santoso', value: 'budi-santoso' },
    { label: 'Drs. Cahaya Wijaya', value: 'cahaya-wijaya' },
    { label: 'Dr. Siti Rahayu', value: 'siti-rahayu' },
  ];

  const equipmentOptions = [
    { label: 'Viscometer Alat A', value: 'viscometer-a' },
    { label: 'Viscometer Alat B', value: 'viscometer-b' },
    { label: 'Flash Point Tester', value: 'flash-point' },
    { label: 'Karl Fischer Titrator', value: 'karl-fischer' },
    { label: 'Density Meter', value: 'density-meter' },
    { label: 'Freeze Point Tester', value: 'freeze-point' },
    { label: 'GC-MS System', value: 'gc-ms' },
  ];

  const testParameterOptions = [
    {
      label: 'Kadar Air',
      value: 'water_content',
      unit: 'ppm',
      standard: '< 30',
    },
    {
      label: 'Viskositas',
      value: 'viscosity',
      unit: 'cSt',
      standard: '1.0-3.0',
    },
    { label: 'Densitas', value: 'density', unit: 'kg/m³', standard: '775-840' },
    {
      label: 'Flash Point',
      value: 'flash_point',
      unit: '°C',
      standard: '> 38',
    },
    {
      label: 'Freeze Point',
      value: 'freeze_point',
      unit: '°C',
      standard: '< -47',
    },
    {
      label: 'Sulfur Content',
      value: 'sulfur_content',
      unit: 'mg/kg',
      standard: '< 3000',
    },
    { label: 'Aromatics', value: 'aromatics', unit: '%v/v', standard: '< 25' },
  ];

  // Mock Siring data
  const mockSiringData: SiringData[] = [
    {
      id: '1',
      location: 'Lab Room A - Storage Cabinet 1',
      current_stock: 15,
      min_threshold: 5,
      max_capacity: 50,
      last_updated: '2025-08-29T08:30:00Z',
      status: 'normal',
    },
    {
      id: '2',
      location: 'Lab Room B - Storage Cabinet 2',
      current_stock: 3,
      min_threshold: 5,
      max_capacity: 40,
      last_updated: '2025-08-29T07:15:00Z',
      status: 'critical',
    },
    {
      id: '3',
      location: 'Lab Room C - Storage Cabinet 3',
      current_stock: 38,
      min_threshold: 8,
      max_capacity: 40,
      last_updated: '2025-08-29T06:45:00Z',
      status: 'full',
    },
  ];

  // Action handlers
  const handleLabAction = (
    record: TestingRecord,
    actionType: LabActionType,
  ) => {
    setEditingRecord(record);
    setCurrentActionType(actionType);
    setActionModalVisible(true);
  };

  const handleActionSubmit = async (actionType: LabActionType, data: any) => {
    console.log('Action submitted:', actionType, data);
    // Here you would normally send the data to your backend
    // For now, just update the local state and show success message
    actionRef.current?.reload();
  };

  const handleSiringClick = (siring: SiringData) => {
    setSelectedSiring(siring);
    setSiringModalVisible(true);
  };

  const handleSiringUpdate = (updatedSiring: SiringData) => {
    console.log('Siring updated:', updatedSiring);
    // Update your siring data here
    message.success('Stock siring berhasil diperbarui');
  };

  const handleView = (record: TestingRecord) => {
    setViewingRecord(record);
    setEditingRecord(undefined);
    setDrawerVisible(true);
  };

  const handleEdit = (record: TestingRecord) => {
    setEditingRecord(record);
    setViewingRecord(undefined);
    form.setFieldsValue(record);
    setDrawerVisible(true);
  };

  const handleViewDetail = (record: TestingRecord) => {
    history.push(`/laboratory/testing/detail/${record.id}`);
  };

  const handleSubmit = async (_values: any) => {
    try {
      if (editingRecord) {
        message.success('Data pengujian berhasil diperbarui');
      } else {
        message.success('Data pengujian berhasil ditambahkan');
      }
      setDrawerVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan data pengujian');
    }
  };

  const handleStatusUpdate = (_record: TestingRecord, newStatus: string) => {
    Modal.confirm({
      title: 'Update Status',
      content: `Apakah Anda yakin ingin mengubah status menjadi "${newStatus}"?`,
      onOk() {
        message.success(`Status berhasil diubah menjadi ${newStatus}`);
        actionRef.current?.reload();
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'default';
      case 'registered':
        return 'processing';
      case 'testing':
        return 'warning';
      case 'waiting_equipment':
        return 'error';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received':
        return 'Diterima';
      case 'registered':
        return 'Terdaftar';
      case 'testing':
        return 'Sedang Diuji';
      case 'waiting_equipment':
        return 'Menunggu Alat';
      case 'completed':
        return 'Selesai';
      case 'failed':
        return 'Gagal';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'normal':
        return 'default';
      case 'urgent':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return '#9fe400';
    if (percentage >= 70) return '#faad14';
    if (percentage >= 50) return '#1890ff';
    return '#fd0017';
  };

  const columns: ProColumns<TestingRecord>[] = [
    {
      title: 'Sample ID',
      dataIndex: 'sample_id',
      key: 'sample_id',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.sample_id}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {record.order_number}
          </span>
          <Tag color={getPriorityColor(record.priority)}>
            {record.priority.toUpperCase()}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Detail Sampel',
      dataIndex: 'sample_type',
      key: 'sample_type',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.sample_type}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.vessel_name} • {record.tank_number}
          </div>
        </div>
      ),
    },
    {
      title: 'Tanggal Diterima',
      dataIndex: 'received_date',
      key: 'received_date',
      valueType: 'date',
      sorter: true,
    },
    {
      title: 'Lab Technician',
      dataIndex: 'lab_technician',
      key: 'lab_technician',
    },
    {
      title: 'Progress',
      dataIndex: 'progress_percentage',
      key: 'progress_percentage',
      render: (_, record) => (
        <div>
          <Progress
            percent={record.progress_percentage}
            size="small"
            strokeColor={getProgressColor(record.progress_percentage)}
            showInfo={false}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
            {record.progress_percentage}% selesai
          </div>
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'testing_status',
      key: 'testing_status',
      render: (_, record) => (
        <Tag color={getStatusColor(record.testing_status)}>
          {getStatusLabel(record.testing_status)}
        </Tag>
      ),
      filters: testingStatusOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Estimasi Selesai',
      dataIndex: 'estimated_completion',
      key: 'estimated_completion',
      valueType: 'dateTime',
      render: (_, record) => (
        <div>
          <div>
            {dayjs(record.estimated_completion).format('DD/MM/YYYY HH:mm')}
          </div>
          {record.actual_completion && (
            <div style={{ fontSize: '12px', color: '#9fe400' }}>
              Selesai:{' '}
              {dayjs(record.actual_completion).format('DD/MM/YYYY HH:mm')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Parameter',
      dataIndex: 'test_parameters',
      key: 'test_parameters',
      render: (_, record) => (
        <div>
          {record.test_parameters.slice(0, 2).map((param) => (
            <Tag key={param} style={{ marginBottom: 2, fontSize: '12px' }}>
              {testParameterOptions.find((opt) => opt.value === param)?.label ||
                param}
            </Tag>
          ))}
          {record.test_parameters.length > 2 && (
            <Tag color="default" style={{ fontSize: '12px' }}>
              +{record.test_parameters.length - 2}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        const getActionButtons = () => {
          switch (record.testing_status) {
            case 'received':
              return [
                <Button
                  key="confirm"
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleLabAction(record, 'confirm_sample')}
                  style={{ color: '#52c41a' }}
                >
                  Konfirmasi Sample
                </Button>,
              ];
            case 'registered':
              return [
                <Button
                  key="waiting"
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleLabAction(record, 'waiting_test')}
                  style={{ color: '#faad14' }}
                >
                  Menunggu Pengujian
                </Button>,
              ];
            case 'testing':
              return [
                <Button
                  key="process"
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleLabAction(record, 'process_test')}
                  style={{ color: '#1890ff' }}
                >
                  Proses Pengujian
                </Button>,
              ];
            case 'waiting_equipment':
              return [
                <Button
                  key="input"
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleLabAction(record, 'input_result')}
                  style={{ color: '#722ed1' }}
                >
                  Input Hasil Pengujian
                </Button>,
              ];
            default:
              return [
                <Button
                  key="complete"
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleLabAction(record, 'complete_test')}
                  style={{ color: '#fd0017' }}
                >
                  Selesai Pengujian
                </Button>,
              ];
          }
        };

        return (
          <Space direction="vertical" size={4}>
            {getActionButtons()}
            <Space>
              <Button
                type="link"
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => handleViewDetail(record)}
                style={{ color: '#1890ff' }}
              >
                Test Report
              </Button>
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
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
            </Space>
          </Space>
        );
      },
    },
  ];

  const mockData: TestingRecord[] = [
    {
      id: '1',
      sample_id: 'SMPL-20250806-001',
      order_number: 'SO-20250806-001',
      sample_type: 'JET A-1',
      vessel_name: 'MT. Commodore One',
      tank_number: 'T.107',
      received_date: '2025-08-06',
      testing_status: 'testing',
      lab_technician: 'Dr. Ahmad Laboratorium',
      equipment_used: 'Viscometer Alat A',
      test_parameters: ['water_content', 'viscosity', 'density', 'flash_point'],
      test_results: {
        water_content: { value: 25, unit: 'ppm', status: 'pass' },
        viscosity: { value: 1.5, unit: 'cSt', status: 'pass' },
        density: { value: 800, unit: 'kg/m³', status: 'pass' },
      },
      progress_percentage: 75,
      priority: 'urgent',
      estimated_completion: '2025-08-06 18:00',
      created_at: '2025-08-06 10:00:00',
      updated_at: '2025-08-06 14:30:00',
    },
    {
      id: '2',
      sample_id: 'SMPL-20250806-002',
      order_number: 'RQ-20250806-002',
      sample_type: 'Avgas',
      vessel_name: 'MT. Pioneer',
      tank_number: 'T.203',
      received_date: '2025-08-06',
      testing_status: 'waiting_equipment',
      lab_technician: 'Ir. Budi Santoso',
      test_parameters: ['water_content', 'density', 'aromatics'],
      test_results: {},
      progress_percentage: 25,
      priority: 'normal',
      estimated_completion: '2025-08-07 12:00',
      quality_notes: 'Menunggu ketersediaan alat GC-MS',
      created_at: '2025-08-06 11:00:00',
      updated_at: '2025-08-06 15:00:00',
    },
    {
      id: '3',
      sample_id: 'SMPL-20250805-001',
      order_number: 'SO-20250805-001',
      sample_type: 'Diesel',
      vessel_name: 'MT. Explorer',
      tank_number: 'T.301',
      received_date: '2025-08-05',
      testing_status: 'completed',
      lab_technician: 'Drs. Cahaya Wijaya',
      equipment_used: 'Flash Point Tester',
      test_parameters: ['sulfur_content', 'flash_point', 'density'],
      test_results: {
        sulfur_content: { value: 2800, unit: 'mg/kg', status: 'pass' },
        flash_point: { value: 42, unit: '°C', status: 'pass' },
        density: { value: 820, unit: 'kg/m³', status: 'pass' },
      },
      progress_percentage: 100,
      priority: 'normal',
      estimated_completion: '2025-08-05 16:00',
      actual_completion: '2025-08-05 15:30',
      created_at: '2025-08-05 09:00:00',
      updated_at: '2025-08-05 15:30:00',
    },
  ];

  const testingSummary = {
    total: mockData.length,
    received: mockData.filter((item) => item.testing_status === 'received')
      .length,
    testing: mockData.filter((item) =>
      ['registered', 'testing'].includes(item.testing_status),
    ).length,
    waiting: mockData.filter(
      (item) => item.testing_status === 'waiting_equipment',
    ).length,
    completed: mockData.filter((item) => item.testing_status === 'completed')
      .length,
  };

  return (
    <PageContainer
      title="Pengujian Laboratorium"
      content="Kelola proses pengujian sampel dengan tracking real-time dan hasil analisis"
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Sampel"
              value={testingSummary.total}
              prefix={<ExperimentOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Sedang Diuji"
              value={testingSummary.testing}
              prefix={<SyncOutlined spin style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Menunggu Alat"
              value={testingSummary.waiting}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Selesai"
              value={testingSummary.completed}
              prefix={<CheckCircleOutlined style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Siring Management Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <DatabaseOutlined style={{ color: '#fd0017' }} />
                Manajemen Stock Siring - Klik untuk Update
              </Space>
            }
            size="small"
          >
            <Row gutter={[12, 12]}>
              {mockSiringData.map((siring) => (
                <Col xs={24} sm={8} key={siring.id}>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => handleSiringClick(siring)}
                    style={{
                      cursor: 'pointer',
                      borderColor:
                        siring.status === 'critical'
                          ? '#ff4d4f'
                          : siring.status === 'low'
                            ? '#faad14'
                            : siring.status === 'full'
                              ? '#1890ff'
                              : '#d9d9d9',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {siring.location}
                      </div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color:
                            siring.status === 'critical'
                              ? '#ff4d4f'
                              : siring.status === 'low'
                                ? '#faad14'
                                : siring.status === 'full'
                                  ? '#1890ff'
                                  : '#52c41a',
                          marginBottom: 4,
                        }}
                      >
                        {siring.current_stock} / {siring.max_capacity}
                      </div>
                      <Badge
                        status={
                          siring.status === 'critical'
                            ? 'error'
                            : siring.status === 'low'
                              ? 'warning'
                              : siring.status === 'full'
                                ? 'processing'
                                : 'success'
                        }
                        text={
                          siring.status === 'critical'
                            ? 'Kritis'
                            : siring.status === 'low'
                              ? 'Rendah'
                              : siring.status === 'full'
                                ? 'Penuh'
                                : 'Normal'
                        }
                      />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <ProTable<TestingRecord>
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
        headerTitle="Daftar Pengujian"
        toolBarRender={() => [
          <Button key="equipment" type="default">
            Status Alat
          </Button>,
          <Button key="report" type="default">
            Laporan Harian
          </Button>,
          <Button key="export" type="default">
            Export Excel
          </Button>,
        ]}
      />

      <Drawer
        title={viewingRecord ? 'Detail Pengujian' : 'Update Pengujian'}
        width={800}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setViewingRecord(undefined);
          setEditingRecord(undefined);
        }}
        extra={
          viewingRecord ? null : (
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
          )
        }
      >
        {viewingRecord ? (
          /* View Mode */
          <div>
            <Card
              title="Informasi Sampel"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Sample ID">
                  {viewingRecord.sample_id}
                </Descriptions.Item>
                <Descriptions.Item label="Order Number">
                  {viewingRecord.order_number}
                </Descriptions.Item>
                <Descriptions.Item label="Jenis Sampel">
                  {viewingRecord.sample_type}
                </Descriptions.Item>
                <Descriptions.Item label="Kapal/Tangki">
                  {viewingRecord.vessel_name} • {viewingRecord.tank_number}
                </Descriptions.Item>
                <Descriptions.Item label="Diterima">
                  {dayjs(viewingRecord.received_date).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Prioritas">
                  <Tag color={getPriorityColor(viewingRecord.priority)}>
                    {viewingRecord.priority.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title="Status Pengujian"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <div style={{ marginBottom: 16 }}>
                <Progress
                  percent={viewingRecord.progress_percentage}
                  strokeColor={getProgressColor(
                    viewingRecord.progress_percentage,
                  )}
                  status={
                    viewingRecord.testing_status === 'completed'
                      ? 'success'
                      : 'active'
                  }
                />
              </div>

              <Steps
                size="small"
                current={
                  viewingRecord.testing_status === 'received'
                    ? 0
                    : viewingRecord.testing_status === 'registered'
                      ? 1
                      : viewingRecord.testing_status === 'testing'
                        ? 2
                        : viewingRecord.testing_status === 'completed'
                          ? 3
                          : 1
                }
                status={
                  viewingRecord.testing_status === 'waiting_equipment'
                    ? 'error'
                    : 'process'
                }
                items={[
                  {
                    title: 'Diterima',
                    description: 'Sampel diterima lab',
                  },
                  {
                    title: 'Registrasi',
                    description: 'Sampel didaftarkan',
                  },
                  {
                    title: 'Pengujian',
                    description: 'Proses pengujian',
                  },
                  {
                    title: 'Selesai',
                    description: 'Pengujian selesai',
                  },
                ]}
              />
            </Card>

            <Card
              title="Parameter & Hasil Pengujian"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <div style={{ marginBottom: 16 }}>
                <strong>Parameter yang Diuji:</strong>
                <div style={{ marginTop: 8 }}>
                  {viewingRecord.test_parameters.map((param) => {
                    const paramInfo = testParameterOptions.find(
                      (opt) => opt.value === param,
                    );
                    const result = viewingRecord.test_results[param];
                    return (
                      <div
                        key={param}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: result ? '#f6ffed' : '#fff2e8',
                          marginBottom: 4,
                          borderRadius: 4,
                          border: `1px solid ${result ? '#d9f7be' : '#ffd591'}`,
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>
                          {paramInfo?.label}
                        </span>
                        <div>
                          {result ? (
                            <span style={{ color: '#9fe400' }}>
                              {result.value} {result.unit} •{' '}
                              {result.status === 'pass' ? 'PASS' : 'FAIL'}
                            </span>
                          ) : (
                            <span style={{ color: '#faad14' }}>
                              Belum diuji
                            </span>
                          )}
                          <div
                            style={{
                              fontSize: '10px',
                              color: '#666',
                              textAlign: 'right',
                            }}
                          >
                            Standard: {paramInfo?.standard}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card title="Informasi Lab" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Lab Technician">
                  {viewingRecord.lab_technician}
                </Descriptions.Item>
                <Descriptions.Item label="Equipment">
                  {viewingRecord.equipment_used || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Estimasi Selesai">
                  {dayjs(viewingRecord.estimated_completion).format(
                    'DD/MM/YYYY HH:mm',
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Actual Selesai">
                  {viewingRecord.actual_completion
                    ? dayjs(viewingRecord.actual_completion).format(
                        'DD/MM/YYYY HH:mm',
                      )
                    : '-'}
                </Descriptions.Item>
              </Descriptions>
              {viewingRecord.quality_notes && (
                <div style={{ marginTop: 12 }}>
                  <strong>Catatan:</strong>
                  <div
                    style={{
                      padding: 8,
                      backgroundColor: '#f0f0f0',
                      borderRadius: 4,
                      marginTop: 4,
                    }}
                  >
                    {viewingRecord.quality_notes}
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          /* Edit Mode */
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Card
              title="Update Status & Progress"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="testing_status"
                    label="Status Pengujian"
                    rules={[
                      { required: true, message: 'Status wajib dipilih' },
                    ]}
                  >
                    <Select
                      placeholder="Pilih status"
                      options={testingStatusOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="progress_percentage"
                    label="Progress (%)"
                    rules={[
                      { required: true, message: 'Progress wajib diisi' },
                    ]}
                  >
                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="lab_technician"
                    label="Lab Technician"
                    rules={[
                      {
                        required: true,
                        message: 'Lab technician wajib dipilih',
                      },
                    ]}
                  >
                    <Select
                      placeholder="Pilih technician"
                      options={labTechnicianOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="equipment_used"
                    label="Equipment yang Digunakan"
                  >
                    <Select
                      placeholder="Pilih equipment"
                      options={equipmentOptions}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title="Parameter Pengujian"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name="test_parameters"
                label="Parameter yang Diuji"
                rules={[{ required: true, message: 'Parameter wajib dipilih' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Pilih parameter pengujian"
                  options={testParameterOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Card>

            <Form.Item name="quality_notes" label="Catatan Kualitas">
              <Input.TextArea
                rows={4}
                placeholder="Catatan mengenai kondisi sampel, alat yang digunakan, atau hasil pengujian..."
              />
            </Form.Item>

            {/* Quick Status Update Buttons */}
            <Card title="Quick Actions" size="small">
              <Space wrap>
                <Button
                  type="default"
                  onClick={() =>
                    editingRecord &&
                    handleStatusUpdate(editingRecord, 'registered')
                  }
                >
                  Mark as Registered
                </Button>
                <Button
                  type="default"
                  onClick={() =>
                    editingRecord &&
                    handleStatusUpdate(editingRecord, 'testing')
                  }
                >
                  Start Testing
                </Button>
                <Button
                  type="default"
                  onClick={() =>
                    editingRecord &&
                    handleStatusUpdate(editingRecord, 'waiting_equipment')
                  }
                >
                  Equipment Wait
                </Button>
                <Button
                  type="primary"
                  style={{ backgroundColor: '#9fe400', borderColor: '#9fe400' }}
                  onClick={() =>
                    editingRecord &&
                    handleStatusUpdate(editingRecord, 'completed')
                  }
                >
                  Mark Complete
                </Button>
              </Space>
            </Card>
          </Form>
        )}
      </Drawer>

      {/* Laboratory Action Modal */}
      <LaboratoryActionModal
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        actionType={currentActionType}
        record={editingRecord}
        onSubmit={handleActionSubmit}
      />

      {/* Siring Management Modal */}
      <SiringManagement
        visible={siringModalVisible}
        onClose={() => setSiringModalVisible(false)}
        siringData={selectedSiring}
        onUpdate={handleSiringUpdate}
      />
    </PageContainer>
  );
};

export default LaboratoryTesting;
