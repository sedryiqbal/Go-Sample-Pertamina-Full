import {
  EditOutlined,
  FileTextOutlined,
  FormOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';

interface SampleOrderRecord {
  id: string;
  order_number: string;
  order_type: 'ready' | 'request'; // To distinguish between ready and request orders
  order_date: string;
  npc_number: string; // Added NPC number
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  quantity: number;
  unit: string;
  lab_location: string;
  category_test: string; // Added category test field
  estimated_delivery_time: number;
  priority: 'normal' | 'urgent'; // Removed 'critical' as per requirement
  status:
    | 'pending'
    | 'confirmed'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';
  // For request orders only
  category?: 'import' | 'local' | 'reference';
  company_sender?: string;
  sender_name?: string;
  sender_phone?: string;
  estimated_arrival?: string;
  photo_sample?: string;
  memo_file?: string;
  notes?: string;
  created_at: string;
  // New field for selected sample from estimation
  selected_sample_id?: string;
}

interface AvailableSample {
  id: string;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  quantity: number;
  unit: string;
  location: string;
  status: 'available' | 'low' | 'urgent';
  received_date: string;
}

const SampleOrder: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [orderType, setOrderType] = useState<'ready' | 'request'>('ready');
  const [editingRecord, setEditingRecord] = useState<
    SampleOrderRecord | undefined
  >();
  const [selectedSample, setSelectedSample] = useState<AvailableSample | null>(
    null,
  );
  const [availableSamples, setAvailableSamples] = useState<AvailableSample[]>(
    [],
  );
  const [fromCalendar, setFromCalendar] = useState(false);

  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const location = useLocation();

  // Mock available samples data (in real app, this would come from estimation API)
  const getAllAvailableSamples = (): AvailableSample[] => [
    {
      id: '1',
      sample_type: 'JET-A1',
      vessel_name: 'MT. Commodore One',
      tank_number: 'Tangki 107',
      quantity: 25,
      unit: 'botol',
      location: 'SHAFTI',
      status: 'available',
      received_date: '2025-09-01',
    },
    {
      id: '2',
      sample_type: 'Avgas',
      vessel_name: 'MT. Pioneer',
      tank_number: 'Tangki 203',
      quantity: 5,
      unit: 'botol',
      location: 'SHAFTI',
      status: 'low',
      received_date: '2025-09-01',
    },
    {
      id: '4',
      sample_type: 'Soft blended',
      vessel_name: 'MT. Ocean Star',
      tank_number: 'Tangki 301',
      quantity: 15,
      unit: 'botol',
      location: 'Balongan',
      status: 'available',
      received_date: '2025-09-02',
    },
    {
      id: '5',
      sample_type: 'JET-A1',
      vessel_name: 'MT. Excellence',
      tank_number: 'Tangki 108',
      quantity: 30,
      unit: 'botol',
      location: 'SHAFTI',
      status: 'available',
      received_date: '2025-09-03',
    },
    {
      id: '6',
      sample_type: 'Avgas',
      vessel_name: 'MV. Explorer',
      tank_number: 'Tangki 204',
      quantity: 20,
      unit: 'botol',
      location: 'SHAFTI',
      status: 'available',
      received_date: '2025-09-03',
    },
    {
      id: '7',
      sample_type: 'JET-A1',
      vessel_name: 'MT. Horizon',
      tank_number: 'Tangki 106',
      quantity: 8,
      unit: 'botol',
      location: 'SHAFTI',
      status: 'low',
      received_date: '2025-09-04',
    },
    {
      id: '8',
      sample_type: 'JET-A1',
      vessel_name: 'MT. Prosperity',
      tank_number: 'Multi tank composite',
      quantity: 50,
      unit: 'botol',
      location: 'SHAFTI',
      status: 'available',
      received_date: '2025-09-05',
    },
  ];

  // Handle URL parameters from calendar redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const action = urlParams.get('action');
    const samples = urlParams.get('samples');
    const date = urlParams.get('date');

    if (action === 'create' && samples) {
      setFromCalendar(true);
      const sampleIds = samples.split(',');
      const allSamples = getAllAvailableSamples();
      const filteredSamples = allSamples.filter((sample) =>
        sampleIds.includes(sample.id),
      );
      setAvailableSamples(filteredSamples);

      if (filteredSamples.length > 0) {
        message.success(
          `${filteredSamples.length} sample tersedia untuk dibuat order pada ${dayjs(date).format('DD/MM/YYYY')}`,
        );
        // Auto open drawer untuk create ready order
        setTimeout(() => {
          handleAddReady();
        }, 500);
      }
    } else {
      setAvailableSamples(getAllAvailableSamples());
    }
  }, [location.search]);

  // Updated sample types as per requirement - changed to "Jenis Product"
  const productTypeOptions = [
    { label: 'JET-A1', value: 'jet-a1' },
    { label: 'Avgas', value: 'avgas' },
    { label: 'Soft blended', value: 'soft-blended' },
  ];

  // Updated tank number options as per requirement
  const tankNumberOptions = [
    { label: 'Tangki 101', value: 'tangki-101' },
    { label: 'Tangki 102', value: 'tangki-102' },
    { label: 'Tangki 103', value: 'tangki-103' },
    { label: 'Tangki 104', value: 'tangki-104' },
    { label: 'Tangki 105', value: 'tangki-105' },
    { label: 'Tangki 106', value: 'tangki-106' },
    { label: 'Tangki 107', value: 'tangki-107' },
    { label: 'Tangki 108', value: 'tangki-108' },
    { label: 'Tangki 109', value: 'tangki-109' },
    { label: 'Tangki 110', value: 'tangki-110' },
    { label: 'Single tank composite', value: 'single-tank-composite' },
    { label: 'Multi tank composite', value: 'multi-tank-composite' },
  ];

  // Mock data for ship options
  const shipOptions = [
    { label: 'MT. Commodore One', value: 'mt-commodore-one' },
    { label: 'MT. Pioneer', value: 'mt-pioneer' },
    { label: 'MT. Explorer', value: 'mt-explorer' },
    { label: 'MT. Commodore Two', value: 'mt-commodore-two' },
    { label: 'MT. Phoenix', value: 'mt-phoenix' },
    { label: 'MT. Discovery', value: 'mt-discovery' },
  ];

  // Updated priority options - removed 'critical'
  const _priorityOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Urgent', value: 'urgent' },
  ];

  const labLocationOptions = [
    { label: 'LPUJ - Priok (1 jam)', value: 'lpuj-priok', time: 1 },
    { label: 'Lemigas - Jakarta (1 jam)', value: 'lemigas-jakarta', time: 1 },
    { label: 'Balongan - Balongan (6 jam)', value: 'balongan', time: 6 },
  ];

  // Added Category Test dropdown as per requirement
  const categoryTestOptions = [
    { label: 'Short Test', value: 'short-test' },
    { label: 'IBS', value: 'ibs' },
    { label: 'CoA', value: 'coa' },
    { label: 'Soak Test', value: 'soak-test' },
  ];

  const _categoryOptions = [
    { label: 'Import Sample', value: 'import' },
    { label: 'Local Sample', value: 'local' },
    { label: 'Reference Sample', value: 'reference' },
  ];

  const handleAddReady = () => {
    setOrderType('ready');
    setEditingRecord(undefined);
    form.resetFields();
    form.setFieldsValue({
      order_date: dayjs(),
      priority: 'normal',
      quantity: 1,
      unit: 'botol',
    });
    setDrawerVisible(true);
  };

  const handleAddRequest = () => {
    setOrderType('request');
    setEditingRecord(undefined);
    form.resetFields();
    form.setFieldsValue({
      order_date: dayjs(),
      priority: 'normal',
      category: 'import',
      quantity: 1,
      unit: 'botol',
    });
    setDrawerVisible(true);
  };

  const handleSampleSelection = (sampleId: string) => {
    const sample = availableSamples.find((s) => s.id === sampleId);
    if (sample) {
      setSelectedSample(sample);
      // Auto-fill form fields based on selected sample
      form.setFieldsValue({
        sample_type: sample.sample_type.toLowerCase().replace('-', '_'),
        vessel_name: sample.vessel_name
          .toLowerCase()
          .replace(/\./g, '')
          .replace(/ /g, '-'),
        tank_number: sample.tank_number.toLowerCase().replace(' ', '-'),
        // Set max quantity based on available stock
        quantity: Math.min(
          form.getFieldValue('quantity') || 1,
          sample.quantity,
        ),
      });
      message.success(
        `Sample ${sample.sample_type} dari ${sample.vessel_name} dipilih`,
      );
    }
  };

  const getSampleStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'low':
        return 'warning';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSampleStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia';
      case 'low':
        return 'Terbatas';
      case 'urgent':
        return 'Urgent';
      default:
        return status;
    }
  };

  const handleEdit = (record: SampleOrderRecord) => {
    setEditingRecord(record);
    setOrderType(record.order_type);
    form.setFieldsValue({
      ...record,
      order_date: record.order_date ? dayjs(record.order_date) : null,
      estimated_arrival: record.estimated_arrival
        ? dayjs(record.estimated_arrival)
        : null,
    });
    setDrawerVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const orderNumber = `${orderType === 'ready' ? 'SO' : 'RQ'}-${dayjs().format('YYYYMMDD')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const labLocation = labLocationOptions.find(
        (lab) => lab.value === values.lab_location,
      );

      const _orderData = {
        ...values,
        order_number: orderNumber,
        order_type: orderType,
        order_date: values.order_date?.format('YYYY-MM-DD'),
        estimated_arrival: values.estimated_arrival?.format('YYYY-MM-DD HH:mm'),
        estimated_delivery_time: labLocation?.time || 1,
        status: 'pending',
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      message.success(
        editingRecord
          ? `${orderType === 'ready' ? 'Ready Order' : 'Request Order'} berhasil diperbarui`
          : `${orderType === 'ready' ? 'Ready Order' : 'Request Order'} berhasil dibuat: ${orderNumber}`,
      );
      setDrawerVisible(false);
      form.resetFields();
      setSelectedSample(null);
      actionRef.current?.reload();
    } catch (_error) {
      message.error(
        `Gagal menyimpan ${orderType === 'ready' ? 'ready order' : 'request order'}`,
      );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'normal':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'confirmed':
        return 'blue';
      case 'picked_up':
        return 'purple';
      case 'in_transit':
        return 'cyan';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'picked_up':
        return 'Diambil';
      case 'in_transit':
        return 'Dalam Perjalanan';
      case 'delivered':
        return 'Terkirim';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  // Unified columns for both ready and request orders
  const columns: ProColumns<SampleOrderRecord>[] = [
    {
      title: 'No. Order',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.order_number}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {record.npc_number}
          </span>
          <Tag color={record.order_type === 'ready' ? 'green' : 'blue'}>
            {record.order_type === 'ready' ? 'Ready' : 'Request'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Tanggal Order',
      dataIndex: 'order_date',
      key: 'order_date',
      valueType: 'date',
      sorter: true,
    },
    {
      title: 'Detail Sample',
      dataIndex: 'sample_type',
      key: 'sample_type',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.sample_type}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.vessel_name} • {record.tank_number}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.quantity} {record.unit}
          </div>
          {record.category && (
            <Tag
              color={
                record.category === 'import'
                  ? 'blue'
                  : record.category === 'local'
                    ? 'green'
                    : 'purple'
              }
            >
              {record.category}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Category Test',
      dataIndex: 'category_test',
      key: 'category_test',
    },
    {
      title: 'Lab Tujuan',
      dataIndex: 'lab_location',
      key: 'lab_location',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{record.lab_location}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            Est. {record.estimated_delivery_time} jam
          </span>
        </Space>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (_, record) => (
        <Tag color={getPriorityColor(record.priority)}>
          {record.priority.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Normal', value: 'normal' },
        { text: 'Urgent', value: 'urgent' },
      ],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusLabel(record.status)}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Dikonfirmasi', value: 'confirmed' },
        { text: 'Diambil', value: 'picked_up' },
        { text: 'Dalam Perjalanan', value: 'in_transit' },
        { text: 'Terkirim', value: 'delivered' },
        { text: 'Dibatalkan', value: 'cancelled' },
      ],
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
        </Space>
      ),
    },
  ];

  // Mock unified data
  const mockData: SampleOrderRecord[] = [
    {
      id: '1',
      order_number: 'SO-20250829-001',
      order_type: 'ready',
      order_date: '2025-08-29',
      npc_number: 'NPC/SO/2025/001',
      sample_type: 'JET-A1',
      vessel_name: 'MT. Commodore One',
      tank_number: 'Tangki 107',
      quantity: 4,
      unit: 'botol',
      lab_location: 'LPUJ - Priok',
      category_test: 'Short Test',
      estimated_delivery_time: 1,
      priority: 'urgent',
      status: 'in_transit',
      photo_sample: 'sample_photo_001.jpg',
      memo_file: 'memo_001.pdf',
      created_at: '2025-08-29 08:30:00',
    },
    {
      id: '2',
      order_number: 'RQ-20250829-001',
      order_type: 'request',
      order_date: '2025-08-29',
      npc_number: 'NPC/RQ/2025/001',
      vessel_name: 'MT. Pioneer',
      tank_number: 'Tangki 203',
      sample_type: 'Avgas',
      category: 'import',
      quantity: 3,
      unit: 'botol',
      company_sender: 'SHAFTI',
      sender_name: 'Moch. Aby Gazal',
      sender_phone: '+62-21-12345678',
      estimated_arrival: '2025-08-29 10:00',
      lab_location: 'Lemigas - Jakarta',
      category_test: 'IBS',
      estimated_delivery_time: 1,
      priority: 'normal',
      status: 'confirmed',
      photo_sample: 'sample_photo_002.jpg',
      memo_file: 'memo_002.pdf',
      created_at: '2025-08-29 09:15:00',
    },
  ];

  const getSummaryData = () => {
    const data = mockData;
    return {
      total: data.length,
      ready: data.filter((item) => item.order_type === 'ready').length,
      request: data.filter((item) => item.order_type === 'request').length,
      pending: data.filter((item) => item.status === 'pending').length,
      in_progress: data.filter((item) =>
        ['confirmed', 'picked_up', 'in_transit'].includes(item.status),
      ).length,
      delivered: data.filter((item) => item.status === 'delivered').length,
    };
  };

  const summaryData = getSummaryData();

  return (
    <PageContainer
      title={
        fromCalendar
          ? 'Create Sample Order dari Kalender'
          : 'Sample Order Management'
      }
      content={
        fromCalendar
          ? `Membuat order sample dari ${availableSamples.length} sample yang tersedia pada tanggal yang dipilih`
          : 'Unified management for Ready Orders and Request Orders'
      }
      extra={[
        ...(fromCalendar
          ? []
          : [
              <Button
                key="add-ready"
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddReady}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Create Ready Order
              </Button>,
              <Button
                key="add-request"
                type="primary"
                icon={<FormOutlined />}
                onClick={handleAddRequest}
              >
                Create Request Order
              </Button>,
            ]),
        ...(fromCalendar
          ? [
              <Button
                key="back-dashboard"
                onClick={() => history.push('/dashboard')}
              >
                ← Kembali ke Dashboard
              </Button>,
            ]
          : []),
      ]}
    >
      {/* Alert for Calendar Mode */}
      {fromCalendar && (
        <Alert
          message="Mode: Create Order dari Kalender Dashboard"
          description={
            <div>
              <div>
                {availableSamples.length} sample tersedia untuk dibuat order
              </div>
              <div>Sample dipilih berdasarkan tanggal aktif pada kalender</div>
              <div>
                Form create order sudah dibuka otomatis dengan sample yang
                tersedia
              </div>
            </div>
          }
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
          closable
        />
      )}
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={summaryData.total}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Ready Orders"
              value={summaryData.ready}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Request Orders"
              value={summaryData.request}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={summaryData.in_progress}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <ProTable<SampleOrderRecord>
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
        headerTitle="Sample Orders List"
        toolBarRender={() => [
          <Button key="export" type="default">
            Export Excel
          </Button>,
        ]}
      />

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingRecord ? (
              <span>
                Edit {orderType === 'ready' ? 'Ready' : 'Request'} Order
              </span>
            ) : (
              <span>
                Create {orderType === 'ready' ? 'Ready' : 'Request'} Order
              </span>
            )}
          </div>
        }
        width={800}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setSelectedSample(null);
        }}
        extra={
          <Space>
            <Button
              onClick={() => {
                setDrawerVisible(false);
                form.resetFields();
                setSelectedSample(null);
              }}
            >
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              Save Order
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Sample Selection Section - Only for Ready Orders */}
          {orderType === 'ready' && availableSamples.length > 0 && (
            <>
              <Alert
                message="Pilih Sample dari Estimasi"
                description="Pilih sample yang tersedia dari data estimasi untuk membuat order:"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form.Item
                name="selected_sample_id"
                label="Pilih Sample Tersedia"
                rules={[{ required: true, message: 'Sample wajib dipilih' }]}
              >
                <Select
                  placeholder="Pilih sample dari estimasi..."
                  onChange={handleSampleSelection}
                  optionLabelProp="label"
                  size="large"
                >
                  {availableSamples.map((sample) => (
                    <Select.Option
                      key={sample.id}
                      value={sample.id}
                      label={`${sample.sample_type} - ${sample.vessel_name}`}
                    >
                      <div style={{ padding: '8px 0' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <Space>
                              <span style={{ fontWeight: 600 }}>
                                {sample.sample_type}
                              </span>
                              <span style={{ color: '#666' }}>
                                • {sample.vessel_name}
                              </span>
                            </Space>
                          </div>
                          <Tag color={getSampleStatusColor(sample.status)}>
                            {getSampleStatusLabel(sample.status)}
                          </Tag>
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#666',
                            marginLeft: 0,
                          }}
                        >
                          {sample.tank_number} • {sample.quantity} {sample.unit}{' '}
                          • {sample.location}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#666',
                            marginLeft: 0,
                          }}
                        >
                          Received:{' '}
                          {dayjs(sample.received_date).format('DD/MM/YYYY')}
                        </div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedSample && (
                <Card
                  size="small"
                  title="Detail Sample Terpilih"
                  style={{
                    marginBottom: 16,
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                  }}
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <div>
                        <strong>Product:</strong> {selectedSample.sample_type}
                      </div>
                      <div>
                        <strong>Vessel:</strong> {selectedSample.vessel_name}
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <strong>Tank:</strong> {selectedSample.tank_number}
                      </div>
                      <div>
                        <strong>Location:</strong> {selectedSample.location}
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <strong>Available:</strong> {selectedSample.quantity}{' '}
                        {selectedSample.unit}
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <Tag
                          color={getSampleStatusColor(selectedSample.status)}
                          style={{ marginLeft: 4 }}
                        >
                          {getSampleStatusLabel(selectedSample.status)}
                        </Tag>
                      </div>
                    </Col>
                  </Row>
                </Card>
              )}

              <Divider orientation="left">Detail Order</Divider>
            </>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="order_date"
                label="Tanggal Order"
                rules={[
                  { required: true, message: 'Tanggal order wajib diisi' },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Pilih tanggal order"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="npc_number"
                label="Nomor NPC"
                rules={[{ required: true, message: 'Nomor NPC wajib diisi' }]}
                tooltip="Nomor NPC (Notification of Product Control)"
              >
                <Input placeholder="227/NPC/SKH/2025" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sample_type"
                label="Jenis Product"
                rules={[
                  { required: true, message: 'Jenis product wajib dipilih' },
                ]}
              >
                <Select
                  placeholder="Pilih jenis product"
                  disabled={orderType === 'ready' && !!selectedSample}
                >
                  {productTypeOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vessel_name"
                label="Kapal"
                rules={[{ required: true, message: 'Kapal wajib dipilih' }]}
              >
                <Select
                  placeholder="Pilih kapal"
                  disabled={orderType === 'ready' && !!selectedSample}
                >
                  {shipOptions.map((ship) => (
                    <Select.Option key={ship.value} value={ship.value}>
                      {ship.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tank_number"
                label="Nomor Tangki"
                rules={[
                  { required: true, message: 'Nomor tangki wajib dipilih' },
                ]}
              >
                <Select
                  placeholder="Pilih nomor tangki"
                  disabled={orderType === 'ready' && !!selectedSample}
                >
                  {tankNumberOptions.map((tank) => (
                    <Select.Option key={tank.value} value={tank.value}>
                      {tank.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category_test"
                label="Category Test"
                rules={[
                  { required: true, message: 'Category test wajib dipilih' },
                ]}
              >
                <Select placeholder="Pilih category test">
                  {categoryTestOptions.map((test) => (
                    <Select.Option key={test.value} value={test.value}>
                      {test.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[
                  { required: true, message: 'Quantity wajib diisi' },
                  ...(orderType === 'ready' && selectedSample
                    ? [
                        {
                          validator: (_: any, value: number) => {
                            if (value && value > selectedSample.quantity) {
                              return Promise.reject(
                                new Error(
                                  `Quantity tidak boleh melebihi stock tersedia (${selectedSample.quantity} ${selectedSample.unit})`,
                                ),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]
                    : []),
                ]}
                extra={
                  orderType === 'ready' && selectedSample ? (
                    <span style={{ color: '#52c41a' }}>
                      Max: {selectedSample.quantity} {selectedSample.unit} (dari
                      stock tersedia)
                    </span>
                  ) : undefined
                }
              >
                <InputNumber
                  min={1}
                  max={
                    orderType === 'ready' && selectedSample
                      ? selectedSample.quantity
                      : undefined
                  }
                  placeholder="Masukkan jumlah"
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    if (
                      orderType === 'ready' &&
                      selectedSample &&
                      value &&
                      value > selectedSample.quantity
                    ) {
                      message.warning(
                        `Quantity tidak boleh melebihi stock tersedia: ${selectedSample.quantity} ${selectedSample.unit}`,
                      );
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[{ required: true, message: 'Unit wajib dipilih' }]}
              >
                <Select placeholder="Pilih unit">
                  <Select.Option value="botol">Botol</Select.Option>
                  <Select.Option value="liter">Liter</Select.Option>
                  <Select.Option value="ml">ml</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Priority wajib dipilih' }]}
              >
                <Select placeholder="Pilih priority">
                  <Select.Option value="normal">
                    <Tag color="blue">Normal</Tag>
                  </Select.Option>
                  <Select.Option value="urgent">
                    <Tag color="red">Urgent</Tag>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="lab_location"
            label="Lab Location"
            rules={[{ required: true, message: 'Lab location wajib dipilih' }]}
            tooltip="Pilih laboratorium tujuan untuk pengujian sample"
          >
            <Select placeholder="Pilih lab location">
              {labLocationOptions.map((lab) => (
                <Select.Option key={lab.value} value={lab.value}>
                  <div style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 500 }}>
                      {lab.label.split(' (')[0]}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Estimasi delivery: {lab.time} jam
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Estimated Arrival for Ready Orders */}
          {orderType === 'ready' && (
            <Form.Item
              name="estimated_arrival"
              label="Estimated Arrival"
              rules={[
                { required: true, message: 'Estimated arrival wajib diisi' },
              ]}
              tooltip="Perkiraan waktu kedatangan sample ke laboratorium"
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                placeholder="Pilih waktu perkiraan kedatangan"
                format="DD/MM/YYYY HH:mm"
              />
            </Form.Item>
          )}

          {/* Fields specific to Request Orders */}
          {orderType === 'request' && (
            <>
              <Divider orientation="left">Detail Request</Divider>

              <Alert
                message="Request Order Information"
                description="Request order digunakan untuk meminta sample baru yang belum tersedia di estimasi"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form.Item
                name="estimated_arrival"
                label="Estimated Arrival"
                rules={[
                  { required: true, message: 'Estimated arrival wajib diisi' },
                ]}
                tooltip="Perkiraan waktu kedatangan sample yang di-request"
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="Pilih waktu perkiraan kedatangan"
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>
            </>
          )}

          <Divider orientation="left">Upload Documents</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="photo_sample"
                label="Photo Sample"
                tooltip="Upload foto sample untuk dokumentasi"
              >
                <Upload
                  listType="picture-card"
                  maxCount={3}
                  accept="image/*"
                  beforeUpload={() => false}
                >
                  <div style={{ textAlign: 'center' }}>
                    <UploadOutlined style={{ fontSize: 20, color: '#666' }} />
                    <div style={{ marginTop: 8, fontSize: '12px' }}>
                      Upload Photo
                    </div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="memo_file"
                label="Memo File"
                tooltip="Upload memo atau dokumen pendukung"
              >
                <Upload
                  maxCount={2}
                  accept=".pdf,.doc,.docx"
                  beforeUpload={() => false}
                >
                  <Button
                    icon={<FileTextOutlined />}
                    style={{
                      width: '100%',
                      height: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div>Upload Memo</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      PDF, DOC, DOCX
                    </div>
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
            tooltip="Catatan tambahan untuk order ini"
          >
            <Input.TextArea
              rows={4}
              placeholder="Catatan tambahan untuk order ini..."
              style={{ resize: 'none' }}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default SampleOrder;
