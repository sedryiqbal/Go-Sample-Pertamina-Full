import {
  CalendarOutlined,
  CarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  FormOutlined,
  PlusOutlined,
  ShoppingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  DatePicker,
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
  Tabs,
  Tag,
  Upload,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

interface StockOrderRecord {
  id: string;
  order_number: string;
  order_date: string; // Changed from sample_date
  npc_number: string; // Added NPC number
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  quantity: number;
  unit: string;
  lab_location: string;
  estimated_delivery_time: number;
  priority: 'normal' | 'urgent' | 'critical';
  status:
    | 'pending'
    | 'confirmed'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';
  sample_officer: string;
  photo_sample?: string; // Updated field name
  memo_file?: string; // Updated field name
  notes?: string;
  created_at: string;
}

interface RequestOrderRecord {
  id: string;
  request_number: string;
  order_date: string; // Added order date
  npc_number: string; // Added NPC number
  vessel_name: string; // Changed to dropdown
  tank_number: string;
  sample_type: string;
  category: 'import' | 'local' | 'reference';
  quantity: number;
  unit: string;
  company_sender: string;
  sender_name: string;
  sender_phone: string;
  estimated_arrival: string;
  lab_location: string;
  estimated_delivery_time: number;
  priority: 'normal' | 'urgent' | 'critical';
  status:
    | 'pending'
    | 'confirmed'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';
  // Removed sample_officer field
  photo_sample?: string; // Updated field name
  memo_file?: string; // Updated field name
  notes?: string;
  created_at: string;
}

type TabType = 'stock' | 'request';

const SampleOrder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('stock');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingStockRecord, setEditingStockRecord] = useState<
    StockOrderRecord | undefined
  >();
  const [editingRequestRecord, setEditingRequestRecord] = useState<
    RequestOrderRecord | undefined
  >();
  const [calendarView, setCalendarView] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedStock, setSelectedStock] = useState<any>(null);

  const stockActionRef = useRef<ActionType>(null);
  const requestActionRef = useRef<ActionType>(null);
  const [stockForm] = Form.useForm();
  const [requestForm] = Form.useForm();

  // Mock data for ship options
  const shipOptions = [
    { label: 'MT. Commodore One', value: 'mt-commodore-one' },
    { label: 'MT. Pioneer', value: 'mt-pioneer' },
    { label: 'MT. Explorer', value: 'mt-explorer' },
    { label: 'MT. Commodore Two', value: 'mt-commodore-two' },
    { label: 'MT. Phoenix', value: 'mt-phoenix' },
    { label: 'MT. Discovery', value: 'mt-discovery' },
  ];

  const priorityOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Urgent', value: 'urgent' },
    { label: 'Critical', value: 'critical' },
  ];

  const labLocationOptions = [
    { label: 'LPUJ - Priok (1 jam)', value: 'lpuj-priok', time: 1 },
    { label: 'Lemigas - Jakarta (1 jam)', value: 'lemigas-jakarta', time: 1 },
    { label: 'Balongan - Balongan (6 jam)', value: 'balongan', time: 6 },
  ];

  const categoryOptions = [
    { label: 'Import Sample', value: 'import' },
    { label: 'Local Sample', value: 'local' },
    { label: 'Reference Sample', value: 'reference' },
  ];

  const sampleTypeOptions = [
    { label: 'JET A-1', value: 'jet-a1' },
    { label: 'Avgas', value: 'avgas' },
    { label: 'Diesel', value: 'diesel' },
    { label: 'Gasoline', value: 'gasoline' },
    { label: 'Crude Oil', value: 'crude_oil' },
  ];

  // Calendar data for available stock
  const getAvailableStock = (value: Dayjs) => {
    const stockByDate: {
      [key: string]: Array<{
        type: 'success' | 'warning' | 'error';
        content: string;
        details: any;
      }>;
    } = {
      '2025-08-29': [
        {
          type: 'success',
          content: 'JET A-1 - MT. Commodore One',
          details: {
            vessel_name: 'MT. Commodore One',
            tank_number: 'T.107',
            sample_type: 'JET A-1',
            available_quantity: 25,
            unit: 'botol',
            expiry_date: '2025-09-29',
          },
        },
        {
          type: 'warning',
          content: 'Avgas - MT. Pioneer',
          details: {
            vessel_name: 'MT. Pioneer',
            tank_number: 'T.203',
            sample_type: 'Avgas',
            available_quantity: 5,
            unit: 'botol',
            expiry_date: '2025-09-28',
          },
        },
      ],
      '2025-08-30': [
        {
          type: 'success',
          content: 'Diesel - MT. Explorer',
          details: {
            vessel_name: 'MT. Explorer',
            tank_number: 'T.301',
            sample_type: 'Diesel',
            available_quantity: 15,
            unit: 'botol',
            expiry_date: '2025-09-30',
          },
        },
      ],
    };

    return stockByDate[value.format('YYYY-MM-DD')] || [];
  };

  const dateCellRender = (value: Dayjs) => {
    const stockData = getAvailableStock(value);
    return (
      <div
        style={{
          fontSize: '10px',
          lineHeight: '12px',
          overflow: 'hidden',
          height: '100%',
          padding: '2px',
        }}
      >
        {stockData.map((item, index) => (
          <Badge
            key={`${item.type}-${index}`}
            status={item.type}
            text={item.content}
            style={{
              fontSize: '9px',
              display: 'block',
              marginBottom: '1px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
            }}
            onClick={() => handleStockSelect(item)}
          />
        ))}
      </div>
    );
  };

  const handleStockSelect = (stockItem: any) => {
    setSelectedStock(stockItem);
    setSelectedDate(selectedDate);
    setEditingStockRecord(undefined);
    stockForm.setFieldsValue({
      order_date: selectedDate,
      sample_type: stockItem.details.sample_type,
      vessel_name: stockItem.details.vessel_name,
      tank_number: stockItem.details.tank_number,
      available_quantity: stockItem.details.available_quantity,
      unit: stockItem.details.unit,
      quantity: 1,
      priority: 'normal',
    });
    setDrawerVisible(true);
  };

  // Common utility functions
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'confirmed':
        return 'processing';
      case 'picked_up':
        return 'warning';
      case 'in_transit':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
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

  // Handlers
  const handleAddStock = () => {
    if (!selectedDate) {
      message.warning('Pilih tanggal terlebih dahulu');
      return;
    }

    const stockData = getAvailableStock(selectedDate);
    if (stockData.length === 0) {
      message.warning('Tidak ada stock tersedia pada tanggal yang dipilih');
      return;
    }

    // Show modal to select stock
    Modal.info({
      title: `Stock Tersedia - ${selectedDate.format('DD/MM/YYYY')}`,
      width: 600,
      content: (
        <div style={{ marginTop: 16 }}>
          {stockData.map((item) => (
            <Card
              key={
                item.details.vessel_name +
                item.details.tank_number +
                item.details.sample_type
              }
              size="small"
              style={{ marginBottom: 8, cursor: 'pointer' }}
              onClick={() => {
                Modal.destroyAll();
                handleStockSelect(item);
              }}
              hoverable
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {item.details.sample_type} - {item.details.vessel_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {item.details.tank_number} •{' '}
                    {item.details.available_quantity} {item.details.unit}
                  </div>
                </div>
                <Badge status={item.type} />
              </div>
            </Card>
          ))}
        </div>
      ),
      okText: 'Tutup',
    });
  };

  const handleAddRequest = () => {
    setEditingRequestRecord(undefined);
    requestForm.resetFields();
    requestForm.setFieldsValue({
      order_date: dayjs(),
      priority: 'normal',
      category: 'import',
      quantity: 1,
      unit: 'botol',
    });
    setDrawerVisible(true);
  };

  const handleEditStock = (record: StockOrderRecord) => {
    setEditingStockRecord(record);
    setEditingRequestRecord(undefined);
    stockForm.setFieldsValue({
      ...record,
      order_date: record.order_date ? dayjs(record.order_date) : null,
    });
    setDrawerVisible(true);
  };

  const handleEditRequest = (record: RequestOrderRecord) => {
    setEditingRequestRecord(record);
    setEditingStockRecord(undefined);
    requestForm.setFieldsValue({
      ...record,
      order_date: record.order_date ? dayjs(record.order_date) : null,
      estimated_arrival: record.estimated_arrival
        ? dayjs(record.estimated_arrival)
        : null,
    });
    setDrawerVisible(true);
  };

  const handleSubmitStock = async (values: any) => {
    try {
      const orderNumber = `SO-${dayjs().format('YYYYMMDD')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const labLocation = labLocationOptions.find(
        (lab) => lab.value === values.lab_location,
      );

      const _orderData = {
        ...values,
        order_number: orderNumber,
        order_date: values.order_date?.format('YYYY-MM-DD'),
        estimated_delivery_time: labLocation?.time || 1,
        status: 'pending',
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      message.success(
        editingStockRecord
          ? 'Stock order berhasil diperbarui'
          : `Stock order berhasil dibuat: ${orderNumber}`,
      );
      setDrawerVisible(false);
      stockForm.resetFields();
      setSelectedStock(null);
      stockActionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan stock order');
    }
  };

  const handleSubmitRequest = async (values: any) => {
    try {
      const requestNumber = `RQ-${dayjs().format('YYYYMMDD')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const labLocation = labLocationOptions.find(
        (lab) => lab.value === values.lab_location,
      );

      const _requestData = {
        ...values,
        request_number: requestNumber,
        order_date: values.order_date?.format('YYYY-MM-DD'),
        estimated_arrival: values.estimated_arrival?.format('YYYY-MM-DD HH:mm'),
        estimated_delivery_time: labLocation?.time || 1,
        status: 'pending',
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      message.success(
        editingRequestRecord
          ? 'Request order berhasil diperbarui'
          : `Request order berhasil dibuat: ${requestNumber}`,
      );
      setDrawerVisible(false);
      requestForm.resetFields();
      requestActionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan request order');
    }
  };

  // Mock data
  const mockStockData: StockOrderRecord[] = [
    {
      id: '1',
      order_number: 'SO-20250829-001',
      order_date: '2025-08-29',
      npc_number: 'NPC/SO/2025/001',
      sample_type: 'JET A-1',
      vessel_name: 'MT. Commodore One',
      tank_number: 'T.107',
      quantity: 4,
      unit: 'botol',
      lab_location: 'LPUJ - Priok',
      estimated_delivery_time: 1,
      priority: 'urgent',
      status: 'in_transit',
      sample_officer: 'Moch. Aby Gazal',
      created_at: '2025-08-29 08:30:00',
      photo_sample: 'sample_photo_001.jpg',
      memo_file: 'memo_001.pdf',
    },
  ];

  const mockRequestData: RequestOrderRecord[] = [
    {
      id: '1',
      request_number: 'RQ-20250829-001',
      order_date: '2025-08-29',
      npc_number: 'NPC/RQ/2025/001',
      vessel_name: 'MT. Commodore One',
      tank_number: 'T.107',
      sample_type: 'JET A-1',
      category: 'import',
      quantity: 4,
      unit: 'botol',
      company_sender: 'SHAFTI',
      sender_name: 'Moch. Aby Gazal',
      sender_phone: '+62-21-12345678',
      estimated_arrival: '2025-08-29 10:00',
      lab_location: 'LPUJ - Priok',
      estimated_delivery_time: 1,
      priority: 'urgent',
      status: 'in_transit',
      created_at: '2025-08-29 08:30:00',
      photo_sample: 'sample_photo_001.jpg',
      memo_file: 'memo_001.pdf',
    },
  ];

  // Column definitions
  const stockColumns: ProColumns<StockOrderRecord>[] = [
    {
      title: 'No. Pesanan',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.order_number}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {record.npc_number}
          </span>
          <Tag color={getPriorityColor(record.priority)}>
            {record.priority.toUpperCase()}
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
      title: 'Detail Sampel',
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
        </div>
      ),
    },
    {
      title: 'Lab Tujuan',
      dataIndex: 'lab_location',
      key: 'lab_location',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutlined style={{ color: '#fd0017', marginRight: 4 }} />
            <span>{record.lab_location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            <ClockCircleOutlined
              style={{ color: '#9fe400', marginRight: 4, fontSize: '12px' }}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {record.estimated_delivery_time} jam
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Sample Officer',
      dataIndex: 'sample_officer',
      key: 'sample_officer',
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
            onClick={() => handleEditStock(record)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const requestColumns: ProColumns<RequestOrderRecord>[] = [
    {
      title: 'No. Request',
      dataIndex: 'request_number',
      key: 'request_number',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.request_number}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {record.npc_number}
          </span>
          <Tag color={getPriorityColor(record.priority)}>
            {record.priority.toUpperCase()}
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
      title: 'Detail Sampel',
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
        </div>
      ),
    },
    {
      title: 'Pengirim',
      dataIndex: 'sender_name',
      key: 'sender_name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.sender_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.company_sender}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.sender_phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Estimasi Kedatangan',
      dataIndex: 'estimated_arrival',
      key: 'estimated_arrival',
      valueType: 'dateTime',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ClockCircleOutlined style={{ color: '#9fe400', marginRight: 4 }} />
          <span>
            {dayjs(record.estimated_arrival).format('DD/MM/YYYY HH:mm')}
          </span>
        </div>
      ),
      sorter: true,
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
            onClick={() => handleEditRequest(record)}
          >
            Edit
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            Hapus
          </Button>
        </Space>
      ),
    },
  ];

  const getSummaryData = () => {
    const data = activeTab === 'stock' ? mockStockData : mockRequestData;
    return {
      total: data.length,
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
      title="Sample Order Management"
      content="Unified management for Stock Orders and Request Orders"
      extra={[
        <Button
          key="view"
          icon={<CalendarOutlined />}
          onClick={() => setCalendarView(!calendarView)}
          disabled={activeTab !== 'stock'}
        >
          {calendarView ? 'View Tabel' : 'View Kalender'}
        </Button>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={activeTab === 'stock' ? handleAddStock : handleAddRequest}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          {activeTab === 'stock' ? 'Buat Stock Order' : 'Buat Request Order'}
        </Button>,
      ]}
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={`Total ${activeTab === 'stock' ? 'Stock' : 'Request'}`}
              value={summaryData.total}
              prefix={<ShoppingOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={summaryData.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Dalam Proses"
              value={summaryData.in_progress}
              prefix={<CarOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Terkirim"
              value={summaryData.delivered}
              prefix={<ShoppingOutlined style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabType)}
        items={[
          {
            key: 'stock',
            label: (
              <Space>
                <ShoppingOutlined />
                Stock Order
              </Space>
            ),
            children: calendarView ? (
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarOutlined
                      style={{ marginRight: 8, color: '#fd0017' }}
                    />
                    Kalender Stock Tersedia - Klik untuk Pesan
                  </div>
                }
              >
                <Calendar
                  mode="month"
                  cellRender={dateCellRender}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  style={{ height: 600 }}
                />
              </Card>
            ) : (
              <ProTable<StockOrderRecord>
                actionRef={stockActionRef}
                rowKey="id"
                search={{ labelWidth: 'auto' }}
                columns={stockColumns}
                dataSource={mockStockData}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                dateFormatter="string"
                headerTitle="Daftar Stock Order"
                toolBarRender={() => [
                  <Button key="track" type="default">
                    Tracking Status
                  </Button>,
                  <Button key="export" type="default">
                    Export Excel
                  </Button>,
                ]}
              />
            ),
          },
          {
            key: 'request',
            label: (
              <Space>
                <FormOutlined />
                Request Order
              </Space>
            ),
            children: (
              <ProTable<RequestOrderRecord>
                actionRef={requestActionRef}
                rowKey="id"
                search={{ labelWidth: 'auto' }}
                columns={requestColumns}
                dataSource={mockRequestData}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                dateFormatter="string"
                headerTitle="Daftar Request Order"
                toolBarRender={() => [
                  <Button key="template" type="default">
                    Download Template
                  </Button>,
                  <Button key="track" type="default">
                    Tracking Status
                  </Button>,
                  <Button key="export" type="default">
                    Export Excel
                  </Button>,
                ]}
              />
            ),
          },
        ]}
      />

      {/* Unified Drawer for Both Types */}
      <Drawer
        title={
          activeTab === 'stock'
            ? editingStockRecord
              ? 'Edit Stock Order'
              : 'Buat Stock Order Baru'
            : editingRequestRecord
              ? 'Edit Request Order'
              : 'Buat Request Order Baru'
        }
        width={700}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          stockForm.resetFields();
          requestForm.resetFields();
          setSelectedStock(null);
          setEditingStockRecord(undefined);
          setEditingRequestRecord(undefined);
        }}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Batal</Button>
            <Button
              type="primary"
              onClick={() =>
                activeTab === 'stock'
                  ? stockForm.submit()
                  : requestForm.submit()
              }
              style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
            >
              {activeTab === 'stock' ? 'Buat Stock Order' : 'Buat Request'}
            </Button>
          </Space>
        }
      >
        {activeTab === 'stock' ? (
          /* Stock Order Form */
          <Form form={stockForm} layout="vertical" onFinish={handleSubmitStock}>
            {selectedStock && (
              <Card
                title="Stock Terpilih"
                size="small"
                style={{ marginBottom: 16, backgroundColor: '#f6ffed' }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {selectedStock.details.sample_type}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {selectedStock.details.vessel_name} •{' '}
                      {selectedStock.details.tank_number}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#9fe400', fontWeight: 500 }}>
                      {selectedStock.details.available_quantity}{' '}
                      {selectedStock.details.unit}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Tersedia
                    </div>
                  </div>
                </div>
              </Card>
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
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="npc_number"
                  label="Nomor NPC"
                  rules={[{ required: true, message: 'Nomor NPC wajib diisi' }]}
                >
                  <Input placeholder="NPC/SO/2025/001" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="sample_type"
                  label="Jenis Sampel"
                  rules={[
                    { required: true, message: 'Jenis sampel wajib diisi' },
                  ]}
                >
                  <Input disabled={!!selectedStock} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vessel_name"
                  label="Nama Kapal"
                  rules={[
                    { required: true, message: 'Nama kapal wajib diisi' },
                  ]}
                >
                  <Input disabled={!!selectedStock} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="tank_number"
                  label="Nomor Tangki"
                  rules={[
                    { required: true, message: 'Nomor tangki wajib diisi' },
                  ]}
                >
                  <Input disabled={!!selectedStock} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="quantity"
                  label="Jumlah Dibutuhkan"
                  rules={[{ required: true, message: 'Jumlah wajib diisi' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="unit"
                  label="Satuan"
                  rules={[{ required: true, message: 'Satuan wajib diisi' }]}
                >
                  <Input disabled={!!selectedStock} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="lab_location"
                  label="Laboratorium Tujuan"
                  rules={[
                    {
                      required: true,
                      message: 'Laboratorium tujuan wajib dipilih',
                    },
                  ]}
                >
                  <Select
                    placeholder="Pilih laboratorium tujuan"
                    options={labLocationOptions}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sample_officer"
                  label="Sample Officer"
                  rules={[
                    { required: true, message: 'Sample officer wajib dipilih' },
                  ]}
                >
                  <Select placeholder="Pilih sample officer">
                    <Select.Option value="aby-gazal">
                      Moch. Aby Gazal
                    </Select.Option>
                    <Select.Option value="sedry-iqbal">
                      Sedry Muhammad Iqbal
                    </Select.Option>
                    <Select.Option value="ahmad-santoso">
                      Ahmad Santoso
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="priority"
              label="Prioritas"
              rules={[{ required: true, message: 'Prioritas wajib dipilih' }]}
            >
              <Select placeholder="Pilih prioritas" options={priorityOptions} />
            </Form.Item>

            {/* File Attachments */}
            <Card title="Lampiran" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="photo_sample" label="Foto Sample">
                    <Upload
                      name="photo"
                      listType="picture"
                      maxCount={1}
                      beforeUpload={() => false}
                    >
                      <Button icon={<UploadOutlined />}>
                        Upload Foto Sample
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="memo_file" label="Memo File">
                    <Upload
                      name="memo"
                      listType="text"
                      maxCount={1}
                      beforeUpload={() => false}
                    >
                      <Button icon={<FileTextOutlined />}>
                        Upload Memo File
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Form.Item name="notes" label="Catatan">
              <Input.TextArea
                rows={3}
                placeholder="Catatan khusus untuk pesanan ini..."
              />
            </Form.Item>
          </Form>
        ) : (
          /* Request Order Form */
          <Form
            form={requestForm}
            layout="vertical"
            onFinish={handleSubmitRequest}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="order_date"
                  label="Tanggal Order"
                  rules={[
                    { required: true, message: 'Tanggal order wajib diisi' },
                  ]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="npc_number"
                  label="Nomor NPC"
                  rules={[{ required: true, message: 'Nomor NPC wajib diisi' }]}
                >
                  <Input placeholder="NPC/RQ/2025/001" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="vessel_name"
                  label="Nama Kapal"
                  rules={[
                    { required: true, message: 'Nama kapal wajib dipilih' },
                  ]}
                >
                  <Select
                    placeholder="Pilih kapal"
                    options={shipOptions}
                    showSearch
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="tank_number"
                  label="Nomor Tangki"
                  rules={[
                    { required: true, message: 'Nomor tangki wajib diisi' },
                  ]}
                >
                  <Input placeholder="T.107" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="sample_type"
                  label="Jenis Sampel"
                  rules={[
                    { required: true, message: 'Jenis sampel wajib dipilih' },
                  ]}
                >
                  <Select
                    placeholder="Pilih jenis sampel"
                    options={sampleTypeOptions}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="category"
                  label="Kategori"
                  rules={[
                    { required: true, message: 'Kategori wajib dipilih' },
                  ]}
                >
                  <Select
                    placeholder="Pilih kategori"
                    options={categoryOptions}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="priority"
                  label="Prioritas"
                  rules={[
                    { required: true, message: 'Prioritas wajib dipilih' },
                  ]}
                >
                  <Select
                    placeholder="Pilih prioritas"
                    options={priorityOptions}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="quantity"
                  label="Jumlah Sampel"
                  rules={[
                    { required: true, message: 'Jumlah sampel wajib diisi' },
                  ]}
                >
                  <InputNumber
                    min={1}
                    placeholder="4"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="unit"
                  label="Satuan"
                  rules={[{ required: true, message: 'Satuan wajib dipilih' }]}
                >
                  <Select placeholder="Pilih satuan">
                    <Select.Option value="botol">Botol</Select.Option>
                    <Select.Option value="liter">Liter</Select.Option>
                    <Select.Option value="ml">ml</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="estimated_arrival"
                  label="Estimasi Kedatangan"
                  rules={[
                    {
                      required: true,
                      message: 'Estimasi kedatangan wajib diisi',
                    },
                  ]}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Sender Information */}
            <Card
              title="Informasi Pengirim"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name="company_sender"
                label="Perusahaan Pengirim"
                rules={[
                  {
                    required: true,
                    message: 'Perusahaan pengirim wajib diisi',
                  },
                ]}
              >
                <Input placeholder="SHAFTI" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="sender_name"
                    label="Nama Pengirim"
                    rules={[
                      { required: true, message: 'Nama pengirim wajib diisi' },
                    ]}
                  >
                    <Input placeholder="Moch. Aby Gazal" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="sender_phone"
                    label="Telepon Pengirim"
                    rules={[
                      {
                        required: true,
                        message: 'Telepon pengirim wajib diisi',
                      },
                    ]}
                  >
                    <Input placeholder="+62-21-12345678" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Form.Item
              name="lab_location"
              label="Laboratorium Tujuan"
              rules={[
                {
                  required: true,
                  message: 'Laboratorium tujuan wajib dipilih',
                },
              ]}
            >
              <Select
                placeholder="Pilih laboratorium tujuan"
                options={labLocationOptions}
              />
            </Form.Item>

            {/* File Attachments */}
            <Card title="Lampiran" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="photo_sample" label="Foto Sample">
                    <Upload
                      name="photo"
                      listType="picture"
                      maxCount={1}
                      beforeUpload={() => false}
                    >
                      <Button icon={<UploadOutlined />}>
                        Upload Foto Sample
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="memo_file" label="Memo File">
                    <Upload
                      name="memo"
                      listType="text"
                      maxCount={1}
                      beforeUpload={() => false}
                    >
                      <Button icon={<FileTextOutlined />}>
                        Upload Memo File
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Form.Item name="notes" label="Catatan Tambahan">
              <Input.TextArea
                rows={3}
                placeholder="Catatan khusus untuk request ini..."
              />
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default SampleOrder;
