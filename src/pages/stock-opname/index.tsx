import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  InputNumber, 
  Select, 
  message,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  DatabaseOutlined, 
  EditOutlined, 
  EyeOutlined,
  ExperimentOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useRef, useState } from 'react';

interface StockOpnameItem {
  id: string;
  sampleCode: string;
  productType: string;
  laboratory: string;
  initialStock: number;
  currentStock: number;
  usedQuantity: number;
  remainingQuantity: number;
  unit: string;
  status: 'available' | 'used' | 'damaged' | 'returned';
  receivedDate: string;
  lastUpdated: string;
  notes?: string;
}

const StockOpname: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockOpnameItem | null>(null);

  const columns: ProColumns<StockOpnameItem>[] = [
    {
      title: 'Kode Sampel',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
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
      title: 'Laboratorium',
      dataIndex: 'laboratory',
      key: 'laboratory',
    },
    {
      title: 'Stock Awal',
      dataIndex: 'initialStock',
      key: 'initialStock',
      render: (_, record) => `${record.initialStock} ${record.unit}`,
    },
    {
      title: 'Stock Saat Ini',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (_, record) => (
        <span style={{ 
          color: record.currentStock === 0 ? '#ff4d4f' : 
                 record.currentStock < record.initialStock * 0.3 ? '#faad14' : '#52c41a'
        }}>
          {record.currentStock} {record.unit}
        </span>
      ),
    },
    {
      title: 'Terpakai',
      dataIndex: 'usedQuantity',
      key: 'usedQuantity',
      render: (_, record) => `${record.usedQuantity} ${record.unit}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const statusConfig = {
          available: { color: 'green', text: 'Tersedia', icon: <CheckCircleOutlined /> },
          used: { color: 'blue', text: 'Terpakai', icon: <ExperimentOutlined /> },
          damaged: { color: 'red', text: 'Rusak', icon: <WarningOutlined /> },
          returned: { color: 'purple', text: 'Dikembalikan', icon: <DatabaseOutlined /> },
        };
        const config = statusConfig[record.status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Tanggal Diterima',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      valueType: 'date',
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleUpdateStock(record)}
          />
        </Space>
      ),
    },
  ];

  const handleViewDetail = (stock: StockOpnameItem) => {
    setSelectedStock(stock);
    // In real app, this would show a detail modal
    message.info(`Detail untuk ${stock.sampleCode}`);
  };

  const handleUpdateStock = (stock: StockOpnameItem) => {
    setSelectedStock(stock);
    form.setFieldsValue({
      sampleCode: stock.sampleCode,
      currentStock: stock.currentStock,
      usedQuantity: stock.usedQuantity,
      status: stock.status,
      notes: stock.notes || '',
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      await form.validateFields();
      message.success('Stock opname berhasil diperbarui');
      setModalVisible(false);
      setSelectedStock(null);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedStock(null);
    form.resetFields();
  };

  // Mock data request
  const fetchStockOpnames = async () => {
    const mockData: StockOpnameItem[] = [
      {
        id: '1',
        sampleCode: 'LPUJ-20250806-001',
        productType: 'JET A-1',
        laboratory: 'LPUJ',
        initialStock: 4,
        currentStock: 2,
        usedQuantity: 2,
        remainingQuantity: 2,
        unit: 'Botol',
        status: 'available',
        receivedDate: '2025-08-06',
        lastUpdated: '2025-08-06T14:00:00Z',
        notes: 'Pengujian density dan viscosity selesai',
      },
      {
        id: '2',
        sampleCode: 'LMG-20250805-002',
        productType: 'Avgas',
        laboratory: 'Lemigas',
        initialStock: 3,
        currentStock: 0,
        usedQuantity: 3,
        remainingQuantity: 0,
        unit: 'Botol',
        status: 'used',
        receivedDate: '2025-08-05',
        lastUpdated: '2025-08-05T16:30:00Z',
        notes: 'Semua sampel telah digunakan untuk pengujian lengkap',
      },
      {
        id: '3',
        sampleCode: 'LPUJ-20250804-003',
        productType: 'JET A-1',
        laboratory: 'LPUJ',
        initialStock: 2,
        currentStock: 1,
        usedQuantity: 0,
        remainingQuantity: 1,
        unit: 'Botol',
        status: 'damaged',
        receivedDate: '2025-08-04',
        lastUpdated: '2025-08-04T12:00:00Z',
        notes: 'Satu botol pecah saat pengangkutan internal lab',
      },
      {
        id: '4',
        sampleCode: 'BLG-20250803-004',
        productType: 'Diesel',
        laboratory: 'Balongan',
        initialStock: 5,
        currentStock: 2,
        usedQuantity: 3,
        remainingQuantity: 2,
        unit: 'Botol',
        status: 'available',
        receivedDate: '2025-08-03',
        lastUpdated: '2025-08-03T18:00:00Z',
      },
    ];

    return {
      data: mockData,
      success: true,
      total: mockData.length,
    };
  };

  return (
    <PageContainer
      title="Stock Opname Sample"
      content="Kelola dan pantau inventaris sampel di laboratorium"
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Total Sampel"
              value={4}
              prefix={<DatabaseOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Tersedia"
              value={2}
              prefix={<CheckCircleOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Terpakai"
              value={1}
              prefix={<ExperimentOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Rusak"
              value={1}
              prefix={<WarningOutlined style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017' }}
            />
          </Card>
        </Col>
      </Row>

      <ProTable<StockOpnameItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={fetchStockOpnames}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="Daftar Stock Opname"
        toolBarRender={() => [
          <Button
            key="export"
            onClick={() => message.info('Export stock opname report')}
          >
            Export Report
          </Button>,
        ]}
      />

      <Modal
        title={`Update Stock - ${selectedStock?.sampleCode}`}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="sampleCode"
            label="Kode Sampel"
          >
            <input disabled style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="currentStock"
                label="Stock Saat Ini"
                rules={[{ required: true, message: 'Stock saat ini wajib diisi' }]}
              >
                <InputNumber 
                  min={0}
                  style={{ width: '100%' }}
                  addonAfter="Botol"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="usedQuantity"
                label="Jumlah Terpakai"
                rules={[{ required: true, message: 'Jumlah terpakai wajib diisi' }]}
              >
                <InputNumber 
                  min={0}
                  style={{ width: '100%' }}
                  addonAfter="Botol"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Status Stock"
            rules={[{ required: true, message: 'Status wajib dipilih' }]}
          >
            <Select placeholder="Pilih status">
              <Select.Option value="available">Tersedia</Select.Option>
              <Select.Option value="used">Terpakai</Select.Option>
              <Select.Option value="damaged">Rusak</Select.Option>
              <Select.Option value="returned">Dikembalikan</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Catatan"
          >
            <input 
              placeholder="Tambahkan catatan perubahan stock..."
              style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default StockOpname;
