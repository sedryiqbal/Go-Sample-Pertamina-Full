import {
  CalendarOutlined,
  CarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  ShoppingOutlined,
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
  Steps,
  Tag,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

interface StockOrderRecord {
  id: string;
  order_number: string;
  sample_date: string;
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
  notes?: string;
  created_at: string;
  pickup_time?: string;
  delivery_time?: string;
  current_location?: string;
}

const StockOrder: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [calendarView, setCalendarView] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<
    StockOrderRecord | undefined
  >();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();

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

  const sampleOfficerOptions = [
    { label: 'Moch. Aby Gazal', value: 'aby-gazal' },
    { label: 'Sedry Muhammad Iqbal', value: 'sedry-iqbal' },
    { label: 'Ahmad Santoso', value: 'ahmad-santoso' },
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
      '2025-08-06': [
        {
          type: 'success',
          content: 'JET A-1 - MT. Commodore One',
          details: {
            vessel_name: 'MT. Commodore One',
            tank_number: 'T.107',
            sample_type: 'JET A-1',
            available_quantity: 25,
            unit: 'botol',
            expiry_date: '2025-09-05',
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
            expiry_date: '2025-09-04',
          },
        },
      ],
      '2025-08-07': [
        {
          type: 'success',
          content: 'Diesel - MT. Explorer',
          details: {
            vessel_name: 'MT. Explorer',
            tank_number: 'T.301',
            sample_type: 'Diesel',
            available_quantity: 15,
            unit: 'botol',
            expiry_date: '2025-09-07',
          },
        },
      ],
      '2025-08-08': [
        {
          type: 'success',
          content: 'JET A-1 - MT. Commodore Two',
          details: {
            vessel_name: 'MT. Commodore Two',
            tank_number: 'T.108',
            sample_type: 'JET A-1',
            available_quantity: 30,
            unit: 'botol',
            expiry_date: '2025-09-08',
          },
        },
        {
          type: 'success',
          content: 'Avgas - MT. Phoenix',
          details: {
            vessel_name: 'MT. Phoenix',
            tank_number: 'T.205',
            sample_type: 'Avgas',
            available_quantity: 12,
            unit: 'botol',
            expiry_date: '2025-09-08',
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
    setEditingRecord(undefined);
    form.setFieldsValue({
      sample_date: selectedDate,
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

  const handleCreateOrder = () => {
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

  const handleSubmit = async (values: any) => {
    try {
      const orderNumber = `SO-${dayjs().format('YYYYMMDD')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const labLocation = labLocationOptions.find(
        (lab) => lab.value === values.lab_location,
      );

      const _orderData = {
        ...values,
        order_number: orderNumber,
        sample_date: values.sample_date?.format('YYYY-MM-DD'),
        estimated_delivery_time: labLocation?.time || 1,
        status: 'pending',
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      if (editingRecord) {
        message.success('Pesanan stock berhasil diperbarui');
      } else {
        message.success(
          `Pesanan stock berhasil dibuat dengan nomor: ${orderNumber}`,
        );
      }

      setDrawerVisible(false);
      form.resetFields();
      setSelectedStock(null);
      actionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan pesanan stock');
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

  const columns: ProColumns<StockOrderRecord>[] = [
    {
      title: 'No. Pesanan',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.order_number}</span>
          <Tag color={getPriorityColor(record.priority)} size="small">
            {record.priority.toUpperCase()}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Tanggal Sampel',
      dataIndex: 'sample_date',
      key: 'sample_date',
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
      title: 'Dibuat',
      dataIndex: 'created_at',
      key: 'created_at',
      valueType: 'dateTime',
      sorter: true,
    },
  ];

  const mockData: StockOrderRecord[] = [
    {
      id: '1',
      order_number: 'SO-20250806-001',
      sample_date: '2025-08-06',
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
      created_at: '2025-08-06 08:30:00',
      pickup_time: '2025-08-06 09:00:00',
      current_location: 'Jalan Tol Cikampek KM 15',
    },
    {
      id: '2',
      order_number: 'SO-20250806-002',
      sample_date: '2025-08-06',
      sample_type: 'Avgas',
      vessel_name: 'MT. Pioneer',
      tank_number: 'T.203',
      quantity: 3,
      unit: 'botol',
      lab_location: 'Lemigas - Jakarta',
      estimated_delivery_time: 1,
      priority: 'normal',
      status: 'confirmed',
      sample_officer: 'Ahmad Santoso',
      created_at: '2025-08-06 10:15:00',
    },
  ];

  const orderSummary = {
    total: mockData.length,
    pending: mockData.filter((item) => item.status === 'pending').length,
    in_progress: mockData.filter((item) =>
      ['confirmed', 'picked_up', 'in_transit'].includes(item.status),
    ).length,
    delivered: mockData.filter((item) => item.status === 'delivered').length,
  };

  return (
    <PageContainer
      title="Pemesanan Stock"
      content="Pesan sampel dari stock kalender yang tersedia dengan estimasi waktu pengiriman"
      extra={[
        <Button
          key="view"
          icon={<CalendarOutlined />}
          onClick={() => setCalendarView(!calendarView)}
        >
          {calendarView ? 'View Tabel' : 'View Kalender'}
        </Button>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateOrder}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          Buat Pesanan Stock
        </Button>,
      ]}
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Pesanan"
              value={orderSummary.total}
              prefix={<ShoppingOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={orderSummary.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Dalam Proses"
              value={orderSummary.in_progress}
              prefix={<CarOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Terkirim"
              value={orderSummary.delivered}
              prefix={<ShoppingOutlined style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017' }}
            />
          </Card>
        </Col>
      </Row>

      {calendarView ? (
        /* Calendar View */
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ marginRight: 8, color: '#fd0017' }} />
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
        /* Table View */
        <ProTable<StockOrderRecord>
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
          headerTitle="Daftar Pesanan Stock"
          toolBarRender={() => [
            <Button key="track" type="default">
              Tracking Status
            </Button>,
            <Button key="export" type="default">
              Export Excel
            </Button>,
          ]}
        />
      )}

      <Drawer
        title={editingRecord ? 'Edit Pesanan Stock' : 'Buat Pesanan Stock Baru'}
        width={600}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setSelectedStock(null);
        }}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Batal</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
            >
              Buat Pesanan
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {selectedStock && (
            <Card
              title="Stock Terpilih"
              size="small"
              style={{ marginBottom: 16, backgroundColor: '#f6ffed' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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

          <Form.Item
            name="sample_date"
            label="Tanggal Sampel"
            rules={[{ required: true, message: 'Tanggal sampel wajib diisi' }]}
          >
            <DatePicker style={{ width: '100%' }} disabled={!!selectedStock} />
          </Form.Item>

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
                rules={[{ required: true, message: 'Nama kapal wajib diisi' }]}
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

          <Form.Item
            name="lab_location"
            label="Laboratorium Tujuan"
            rules={[
              { required: true, message: 'Laboratorium tujuan wajib dipilih' },
            ]}
          >
            <Select
              placeholder="Pilih laboratorium tujuan"
              onChange={(value) => {
                const lab = labLocationOptions.find(
                  (lab) => lab.value === value,
                );
                if (lab) {
                  form.setFieldsValue({ estimated_delivery_time: lab.time });
                }
              }}
            >
              {labLocationOptions.map((lab) => (
                <Select.Option key={lab.value} value={lab.value}>
                  {lab.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sample_officer"
                label="Sample Officer"
                rules={[
                  { required: true, message: 'Sample officer wajib dipilih' },
                ]}
              >
                <Select
                  placeholder="Pilih sample officer"
                  options={sampleOfficerOptions}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Prioritas"
                rules={[{ required: true, message: 'Prioritas wajib dipilih' }]}
              >
                <Select
                  placeholder="Pilih prioritas"
                  options={priorityOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Catatan">
            <Input.TextArea
              rows={3}
              placeholder="Catatan khusus untuk pesanan ini..."
            />
          </Form.Item>

          {/* Process Steps */}
          <Card title="Tahapan Proses" size="small">
            <Steps
              size="small"
              current={0}
              items={[
                {
                  title: 'Konfirmasi',
                  description: 'Pesanan dikonfirmasi',
                },
                {
                  title: 'Pengambilan',
                  description: 'Sampel diambil',
                },
                {
                  title: 'Pengiriman',
                  description: 'Dalam perjalanan ke lab',
                },
                {
                  title: 'Selesai',
                  description: 'Sampel sampai di lab',
                },
              ]}
            />
          </Card>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default StockOrder;
