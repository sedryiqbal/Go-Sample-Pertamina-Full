import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  InputNumber, 
  message,
  Card,
  Row,
  Col,
  Calendar,
  Badge,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  ShoppingCartOutlined, 
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useRef, useState } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

interface StockOrderItem {
  id: string;
  orderNumber: string;
  productType: string;
  shipName: string;
  quantity: number;
  unit: string;
  laboratory: string;
  estimatedTime: string;
  scheduledDate: string;
  priority: 'normal' | 'urgent' | 'critical';
  status: 'scheduled' | 'confirmed' | 'picked-up' | 'delivered';
  createdAt: string;
}

const SampleOrderStock: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const columns: ProColumns<StockOrderItem>[] = [
    {
      title: 'Nomor Order',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      copyable: true,
    },
    {
      title: 'Jenis Produk',
      dataIndex: 'productType',
      key: 'productType',
      valueEnum: {
        'JET A-1': { text: 'JET A-1', status: 'Processing' },
        'Avgas': { text: 'Avgas', status: 'Success' },
        'Diesel': { text: 'Diesel', status: 'Warning' },
      },
    },
    {
      title: 'Kapal',
      dataIndex: 'shipName',
      key: 'shipName',
    },
    {
      title: 'Jumlah',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_, record) => `${record.quantity} ${record.unit}`,
    },
    {
      title: 'Laboratorium',
      dataIndex: 'laboratory',
      key: 'laboratory',
    },
    {
      title: 'Estimasi Waktu',
      dataIndex: 'estimatedTime',
      key: 'estimatedTime',
      render: (_, record) => (
        <Tag icon={<ClockCircleOutlined />} color="blue">
          {record.estimatedTime}
        </Tag>
      ),
    },
    {
      title: 'Tanggal Terjadwal',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      valueType: 'date',
    },
    {
      title: 'Prioritas',
      dataIndex: 'priority',
      key: 'priority',
      render: (_, record) => {
        const priorityConfig = {
          normal: { color: 'default', text: 'Normal' },
          urgent: { color: 'orange', text: 'Urgent' },
          critical: { color: 'red', text: 'Critical' },
        };
        const config = priorityConfig[record.priority];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const statusConfig = {
          scheduled: { color: 'blue', text: 'Terjadwal' },
          confirmed: { color: 'orange', text: 'Dikonfirmasi' },
          'picked-up': { color: 'purple', text: 'Diambil' },
          delivered: { color: 'green', text: 'Dikirim' },
        };
        const config = statusConfig[record.status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            onClick={() => handleConfirmOrder(record)}
            disabled={record.status !== 'scheduled'}
          >
            Konfirmasi
          </Button>
        </Space>
      ),
    },
  ];

  const handleConfirmOrder = (order: StockOrderItem) => {
    Modal.confirm({
      title: 'Konfirmasi Pemesanan',
      content: `Apakah Anda yakin ingin mengkonfirmasi pemesanan ${order.orderNumber}?`,
      onOk: async () => {
        message.success('Pemesanan berhasil dikonfirmasi');
        actionRef.current?.reload();
      },
    });
  };

  const handleModalOk = async () => {
    try {
      await form.validateFields();
      message.success('Pemesanan stock berhasil dibuat');
      setModalVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleLabChange = (value: string) => {
    const laboratoryEstimation = {
      'lpuj': '1 jam',
      'lemigas': '1 jam',
      'balongan': '6 jam',
    };
    form.setFieldsValue({ 
      estimatedTime: laboratoryEstimation[value as keyof typeof laboratoryEstimation] 
    });
  };

  // Mock data request
  const fetchStockOrders = async () => {
    const mockOrders: StockOrderItem[] = [
      {
        id: '1',
        orderNumber: 'STK-20250806-001',
        productType: 'JET A-1',
        shipName: 'MT. Commodore One',
        quantity: 4,
        unit: 'Botol',
        laboratory: 'LPUJ',
        estimatedTime: '1 jam',
        scheduledDate: '2025-08-08',
        priority: 'normal',
        status: 'scheduled',
        createdAt: '2025-08-06',
      },
      {
        id: '2',
        orderNumber: 'STK-20250805-002',
        productType: 'Avgas',
        shipName: 'MT. Pioneer',
        quantity: 2,
        unit: 'Botol',
        laboratory: 'Lemigas',
        estimatedTime: '1 jam',
        scheduledDate: '2025-08-07',
        priority: 'urgent',
        status: 'confirmed',
        createdAt: '2025-08-05',
      },
      {
        id: '3',
        orderNumber: 'STK-20250804-003',
        productType: 'JET A-1',
        shipName: 'MT. Explorer',
        quantity: 3,
        unit: 'Botol',
        laboratory: 'LPUJ',
        estimatedTime: '1 jam',
        scheduledDate: '2025-08-09',
        priority: 'normal',
        status: 'delivered',
        createdAt: '2025-08-04',
      },
    ];

    return {
      data: mockOrders,
      success: true,
      total: mockOrders.length,
    };
  };

  // Calendar data for stock estimation
  const getCalendarData = (value: Dayjs) => {
    const stockData: { [key: string]: Array<{ type: 'success' | 'warning' | 'error'; content: string }> } = {
      '2025-08-07': [
        { type: 'warning', content: 'STK-20250805-002 - Avgas (Urgent)' },
      ],
      '2025-08-08': [
        { type: 'success', content: 'STK-20250806-001 - JET A-1' },
      ],
      '2025-08-09': [
        { type: 'success', content: 'STK-20250804-003 - JET A-1' },
      ],
      '2025-08-10': [
        { type: 'success', content: 'Stock Tersedia - JET A-1' },
        { type: 'warning', content: 'Stock Terbatas - Avgas' },
      ],
    };
    
    return stockData[value.format('YYYY-MM-DD')] || [];
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getCalendarData(value);
    return (
      <div>
        {listData.map((item) => (
          <Badge
            key={`${item.type}-${item.content}`}
            status={item.type}
            text={item.content.length > 20 ? `${item.content.substring(0, 20)}...` : item.content}
            style={{ 
              fontSize: '10px', 
              display: 'block', 
              marginBottom: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <PageContainer
      title="Pemesanan Stock Sample"
      content="Kelola pemesanan sampel dari stock kalender yang tersedia"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <ProTable<StockOrderItem>
            columns={columns}
            actionRef={actionRef}
            cardBordered
            request={fetchStockOrders}
            rowKey="id"
            search={{
              labelWidth: 'auto',
            }}
            pagination={{
              pageSize: 10,
              showQuickJumper: true,
            }}
            dateFormatter="string"
            headerTitle="Daftar Pemesanan Stock"
            toolBarRender={() => [
              <Button
                key="button"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                type="primary"
              >
                Buat Pemesanan Stock
              </Button>,
            ]}
          />
        </Col>

        <Col xs={24} lg={10}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ marginRight: 8, color: '#fd0017' }} />
                Kalender Stock & Pemesanan
              </div>
            }
          >
            <Calendar
              mode="month"
              dateCellRender={dateCellRender}
              value={selectedDate}
              onChange={setSelectedDate}
              style={{ height: 400 }}
            />
            <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
              <div style={{ marginBottom: 4 }}>
                <Badge status="success" text="Stock Tersedia / Pemesanan Normal" />
              </div>
              <div style={{ marginBottom: 4 }}>
                <Badge status="warning" text="Stock Terbatas / Pemesanan Urgent" />
              </div>
              <div>
                <Badge status="error" text="Stock Kosong / Pemesanan Critical" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Buat Pemesanan Stock"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            quantity: 2,
            unit: 'Botol',
            priority: 'normal',
          }}
        >
          <Form.Item
            name="productType"
            label="Jenis Produk"
            rules={[{ required: true, message: 'Jenis produk wajib dipilih' }]}
          >
            <Select placeholder="Pilih jenis produk">
              <Option value="JET A-1">JET A-1</Option>
              <Option value="Avgas">Avgas</Option>
              <Option value="Diesel">Diesel</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="shipName"
            label="Nama Kapal"
            rules={[{ required: true, message: 'Nama kapal wajib dipilih' }]}
          >
            <Select placeholder="Pilih kapal dari stock">
              <Option value="MT. Commodore One">MT. Commodore One</Option>
              <Option value="MT. Pioneer">MT. Pioneer</Option>
              <Option value="MT. Explorer">MT. Explorer</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Jumlah Sample"
                rules={[{ required: true, message: 'Jumlah sample wajib diisi' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Satuan"
                rules={[{ required: true, message: 'Satuan wajib dipilih' }]}
              >
                <Select>
                  <Option value="Botol">Botol</Option>
                  <Option value="Liter">Liter</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="laboratory"
            label="Laboratorium Tujuan"
            rules={[{ required: true, message: 'Laboratorium wajib dipilih' }]}
          >
            <Select placeholder="Pilih laboratorium" onChange={handleLabChange}>
              <Option value="lpuj">LPUJ - Priok</Option>
              <Option value="lemigas">Lemigas - Jakarta</Option>
              <Option value="balongan">Balongan - Balongan</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="estimatedTime"
            label="Estimasi Waktu Pengantaran"
          >
            <Select disabled>
              <Option value="1 jam">1 jam</Option>
              <Option value="6 jam">6 jam</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="scheduledDate"
            label="Tanggal Terjadwal"
            rules={[{ required: true, message: 'Tanggal terjadwal wajib diisi' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              placeholder="Pilih tanggal berdasarkan kalender stock"
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Prioritas"
            rules={[{ required: true, message: 'Prioritas wajib dipilih' }]}
          >
            <Select placeholder="Pilih prioritas">
              <Option value="normal">Normal</Option>
              <Option value="urgent">Urgent</Option>
              <Option value="critical">Critical</Option>
            </Select>
          </Form.Item>
        </Form>

        <div style={{ 
          background: '#f6f6f6', 
          padding: '12px', 
          borderRadius: '6px',
          marginTop: '16px'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <ShoppingCartOutlined style={{ marginRight: 4 }} />
            Pemesanan stock akan mengambil sampel dari inventory yang sudah tersedia berdasarkan kalender stock.
          </Text>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default SampleOrderStock;
