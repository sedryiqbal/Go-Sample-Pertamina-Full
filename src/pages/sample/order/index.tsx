import {
  CarOutlined,
  EditOutlined,
  FileTextOutlined,
  FormOutlined,
  PlusOutlined,
  ShoppingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  DatePicker,
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
import React, { useRef, useState } from 'react';

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
}

const SampleOrder: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [orderType, setOrderType] = useState<'ready' | 'request'>('ready');
  const [editingRecord, setEditingRecord] = useState<
    SampleOrderRecord | undefined
  >();

  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();

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
  const priorityOptions = [
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

  const categoryOptions = [
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
      setSelectedStock(null);
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
      title="Sample Order Management"
      content="Unified management for Ready Orders and Request Orders"
      extra={[
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
          style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
        >
          Create Request Order
        </Button>,
      ]}
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={summaryData.total}
              prefix={<ShoppingOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Ready Orders"
              value={summaryData.ready}
              prefix={<ShoppingOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Request Orders"
              value={summaryData.request}
              prefix={<FormOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={summaryData.in_progress}
              prefix={<CarOutlined style={{ color: '#faad14' }} />}
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
          editingRecord
            ? `Edit ${orderType === 'ready' ? 'Ready' : 'Request'} Order`
            : `Create ${orderType === 'ready' ? 'Ready' : 'Request'} Order`
        }
        width={800}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
        }}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
            >
              Save
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                label="Jenis Product"
                rules={[
                  { required: true, message: 'Jenis product wajib dipilih' },
                ]}
              >
                <Select
                  placeholder="Pilih jenis product"
                  options={productTypeOptions}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vessel_name"
                label="Kapal"
                rules={[{ required: true, message: 'Kapal wajib dipilih' }]}
              >
                <Select placeholder="Pilih kapal" options={shipOptions} />
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
                  options={tankNumberOptions}
                />
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
                <Select
                  placeholder="Pilih category test"
                  options={categoryTestOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: 'Quantity wajib diisi' }]}
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
                <Select
                  placeholder="Pilih priority"
                  options={priorityOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="lab_location"
            label="Lab Location"
            rules={[{ required: true, message: 'Lab location wajib dipilih' }]}
          >
            <Select
              placeholder="Pilih lab location"
              options={labLocationOptions}
            />
          </Form.Item>

          {/* Fields specific to Request Orders */}
          {orderType === 'request' && (
            <>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Category wajib dipilih' }]}
              >
                <Select
                  placeholder="Pilih category"
                  options={categoryOptions}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="company_sender" label="Company Sender">
                    <Input placeholder="SHAFTI" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="estimated_arrival" label="Estimated Arrival">
                    <DatePicker
                      showTime
                      style={{ width: '100%' }}
                      placeholder="Select arrival time"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="sender_name" label="Sender Name">
                    <Input placeholder="Moch. Aby Gazal" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="sender_phone" label="Sender Phone">
                    <Input placeholder="+62-21-12345678" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="photo_sample" label="Photo Sample">
                <Upload>
                  <Button icon={<UploadOutlined />}>Upload Photo</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="memo_file" label="Memo File">
                <Upload>
                  <Button icon={<FileTextOutlined />}>Upload Memo</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea
              rows={3}
              placeholder="Additional notes for this order..."
            />
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default SampleOrder;
