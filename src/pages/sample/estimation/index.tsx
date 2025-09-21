import {
  CalendarOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  WarningOutlined,
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
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { StadisManagement } from '@/components';
import type { StadisData } from '@/components/StadisManagement';

interface SampleEstimationRecord {
  id: string;
  sample_type: string; // Now called "Jenis Product"
  vessel_name: string;
  tank_number: string;
  quantity: number;
  unit: string;
  received_date: string;
  status: 'available' | 'low' | 'urgent' | 'used'; // Changed "critical" to "urgent"
  location: string;
  estimated_time?: string;
  notes?: string;
}

// Stadis Stock Card Component
const StadisStockCard: React.FC<{
  stadis: StadisData;
  handleStadisEdit: (stadis: StadisData) => void;
}> = ({ stadis, handleStadisEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#52c41a';
      case 'low':
        return '#faad14';
      case 'urgent':
        return '#ff4d4f';
      case 'full':
        return '#1890ff';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Stock Rendah';
      case 'urgent':
        return 'Urgent';
      case 'full':
        return 'Penuh';
      default:
        return 'Tidak Diketahui';
    }
  };

  const getStockPercentage = () => {
    return Math.round((stadis.current_stock / stadis.max_capacity) * 100);
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DatabaseOutlined style={{ color: '#fd0017' }} />
          <span>Stadis Stock - {stadis.location}</span>
        </div>
      }
      extra={
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleStadisEdit(stadis)}
          style={{
            backgroundColor: '#fd0017',
            borderColor: '#fd0017',
            boxShadow: 'none',
          }}
        >
          Kelola Stock
        </Button>
      }
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0',
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col span={24}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Statistic
              title=""
              value={stadis.current_stock}
              suffix={`/ ${stadis.max_capacity} unit`}
              valueStyle={{
                color: getStatusColor(stadis.status),
                fontSize: '28px',
                fontWeight: 'bold',
              }}
            />
            <div
              style={{
                marginTop: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#666',
              }}
            >
              {getStockPercentage()}% dari kapasitas
            </div>
          </div>
        </Col>

        <Col span={24}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#fafafa',
              borderRadius: '6px',
              border: '1px solid #f0f0f0',
            }}
          >
            <div>
              <div
                style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}
              >
                Status Stock
              </div>
              <Tag
                style={{
                  backgroundColor: getStatusColor(stadis.status),
                  color: '#fff',
                  border: 'none',
                  fontWeight: '500',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                {getStatusText(stadis.status)}
              </Tag>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}
              >
                Batas Minimum
              </div>
              <div
                style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}
              >
                {stadis.min_threshold} unit
              </div>
            </div>
          </div>
        </Col>

        <Col span={24}>
          <div
            style={{
              fontSize: '11px',
              color: '#999',
              textAlign: 'center',
              borderTop: '1px solid #f0f0f0',
              paddingTop: '8px',
              marginTop: '8px',
            }}
          >
            Terakhir diperbarui:{' '}
            {new Date(stadis.last_updated).toLocaleString('id-ID')}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

const SampleEstimation: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<
    SampleEstimationRecord | undefined
  >();
  const [calendarView, setCalendarView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();

  // Stadis Management states
  const [stadisDrawerVisible, setStadisDrawerVisible] = useState(false);
  const [selectedStadis, setSelectedStadis] = useState<
    StadisData | undefined
  >();

  // Updated sample types as per requirement
  const productTypeOptions = [
    { label: 'JET-A1', value: 'jet-a1' },
    { label: 'Avgas', value: 'avgas' },
    { label: 'Soft blended', value: 'soft-blended' },
  ];

  const vesselOptions = [
    { label: 'MT. Commodore One', value: 'mt-commodore-one' },
    { label: 'MT. Pioneer', value: 'mt-pioneer' },
    { label: 'MV. Explorer', value: 'mv-explorer' },
    { label: 'MT. Serenity', value: 'mt-serenity' },
    { label: 'MT. Ocean Star', value: 'mt-ocean-star' },
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

  const handleAdd = () => {
    setEditingRecord(undefined);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: SampleEstimationRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      received_date: record.received_date ? dayjs(record.received_date) : null,
    });
    setDrawerVisible(true);
  };

  const handleDelete = (record: SampleEstimationRecord) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus',
      content: `Apakah Anda yakin ingin menghapus estimasi sample ${record.sample_type} dari ${record.vessel_name}?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk() {
        message.success(
          `Estimasi sample ${record.sample_type} berhasil dihapus`,
        );
        actionRef.current?.reload();
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const _formattedValues = {
        ...values,
        received_date: values.received_date?.format('YYYY-MM-DD'),
      };

      if (editingRecord) {
        message.success('Estimasi sample berhasil diperbarui');
      } else {
        message.success('Estimasi sample berhasil ditambahkan');
      }
      setDrawerVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan data estimasi sample');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'low':
        return 'warning';
      case 'urgent': // Changed from "critical"
        return 'error';
      case 'used':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia';
      case 'low':
        return 'Terbatas';
      case 'urgent': // Changed from "Kritis"
        return 'Urgent';
      case 'used':
        return 'Terpakai';
      default:
        return status;
    }
  };

  const columns: ProColumns<SampleEstimationRecord>[] = [
    {
      title: 'Jenis Product', // Changed from "Jenis Sample"
      dataIndex: 'sample_type',
      key: 'sample_type',
      render: (_, record) => (
        <Space>
          <DatabaseOutlined style={{ color: '#fd0017' }} />
          <span style={{ fontWeight: 500 }}>{record.sample_type}</span>
        </Space>
      ),
      filters: productTypeOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Kapal/Tangki',
      dataIndex: 'vessel_name',
      key: 'vessel_name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.vessel_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.tank_number}
          </div>
        </div>
      ),
    },
    {
      title: 'Kuantitas',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_, record) => (
        <span>
          {record.quantity} {record.unit}
        </span>
      ),
      sorter: true,
    },
    {
      title: 'Tanggal Diterima',
      dataIndex: 'received_date',
      key: 'received_date',
      valueType: 'date',
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
      filters: [
        { text: 'Tersedia', value: 'available' },
        { text: 'Terbatas', value: 'low' },
        { text: 'Urgent', value: 'urgent' }, // Changed from "Kritis"
        { text: 'Terpakai', value: 'used' },
      ],
    },
    {
      title: 'Lokasi',
      dataIndex: 'location',
      key: 'location',
      render: (_, record) => (
        <Space>
          <WarningOutlined style={{ color: '#faad14' }} />
          {record.location}
        </Space>
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

  const mockData: SampleEstimationRecord[] = [
    {
      id: '1',
      sample_type: 'JET-A1',
      vessel_name: 'MT. Commodore One',
      tank_number: 'Tangki 107',
      quantity: 25,
      unit: 'botol',
      received_date: '2025-08-05',
      status: 'available',
      location: 'SHAFTI',
      notes: 'Sample dari kapal import untuk pengujian kualitas',
    },
    {
      id: '2',
      sample_type: 'Avgas',
      vessel_name: 'MT. Pioneer',
      tank_number: 'Tangki 203',
      quantity: 5,
      unit: 'botol',
      received_date: '2025-08-04',
      status: 'low',
      location: 'SHAFTI',
      notes: 'Stock menipis, perlu replenishment',
    },
    {
      id: '3',
      sample_type: 'Soft blended',
      vessel_name: 'MT. Explorer',
      tank_number: 'Tangki 301',
      quantity: 2,
      unit: 'botol',
      received_date: '2025-08-03',
      status: 'urgent', // Changed from "critical"
      location: 'Balongan',
      notes: 'Stock urgent, perlu segera direplenish',
    },
  ];

  // Mock data for stadis management
  const mockStadisData: StadisData[] = [
    {
      id: '1',
      location: 'Laboratory SHAFTI',
      current_stock: 45,
      min_threshold: 20,
      max_capacity: 100,
      last_updated: '2025-01-12T09:30:00Z',
      status: 'normal',
    },
  ];

  // Stadis management functions
  const handleStadisEdit = (stadis: StadisData) => {
    setSelectedStadis(stadis);
    setStadisDrawerVisible(true);
  };

  const handleStadisUpdate = (updatedStadis: StadisData) => {
    console.log('Updated stadis:', updatedStadis);
    // Here you would typically update your state or call an API
    message.success('Stock stadis berhasil diperbarui');
  };

  const stockSummary = {
    total: mockData.length,
    available: mockData.filter((item) => item.status === 'available').length,
    low: mockData.filter((item) => item.status === 'low').length,
    urgent: mockData.filter((item) => item.status === 'urgent').length, // Changed from "critical"
  };

  // Calendar data for stock
  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const stockData: {
      [key: string]: Array<{ type: string; content: string }>;
    } = {
      '2025-08-05': [
        {
          type: 'success',
          content: 'JET-A1 - MT. Commodore One (25 botol)',
        },
      ],
      '2025-08-04': [
        {
          type: 'warning',
          content: 'Avgas - MT. Pioneer (5 botol)',
        },
      ],
      '2025-08-03': [
        {
          type: 'error',
          content: 'Soft blended - MT. Explorer (2 botol)',
        },
      ],
    };
    return stockData[dateStr] || [];
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {listData.map((item, index) => (
          <li key={`${item.type}-${item.content}-${index}`}>
            <Badge
              status={item.type as any}
              text={
                <span style={{ fontSize: '10px' }}>
                  {item.content.substring(0, 20)}...
                </span>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <PageContainer
      title="Estimasi Sample" // Changed from "Estimasi Stock"
      content="Kelola estimasi ketersediaan sample dengan informasi lokasi dan status"
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
          onClick={handleAdd}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          Tambah Estimasi Sample
        </Button>,
      ]}
    >
      <Tabs
        defaultActiveKey="estimation"
        items={[
          {
            key: 'estimation',
            label: 'Estimasi Sample',
            children: (
              <div>
                {/* Summary Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Total Sample"
                        value={stockSummary.total}
                        prefix={
                          <DatabaseOutlined style={{ color: '#0073fe' }} />
                        }
                        valueStyle={{ color: '#0073fe' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Tersedia"
                        value={stockSummary.available}
                        prefix={
                          <DatabaseOutlined style={{ color: '#9fe400' }} />
                        }
                        valueStyle={{ color: '#9fe400' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Terbatas"
                        value={stockSummary.low}
                        prefix={
                          <WarningOutlined style={{ color: '#faad14' }} />
                        }
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card>
                      <Statistic
                        title="Urgent" // Changed from "Kritis"
                        value={stockSummary.urgent}
                        prefix={
                          <WarningOutlined style={{ color: '#fd0017' }} />
                        }
                        valueStyle={{ color: '#fd0017' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {calendarView ? (
                  <Card title="Kalender Estimasi Sample">
                    <Calendar
                      dateCellRender={dateCellRender}
                      value={selectedDate}
                      onSelect={setSelectedDate}
                    />
                  </Card>
                ) : (
                  <ProTable<SampleEstimationRecord>
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
                    headerTitle="Daftar Estimasi Sample"
                    toolBarRender={() => [
                      <Button key="export" type="default">
                        Export Excel
                      </Button>,
                      <Button key="import" type="default">
                        Import Excel
                      </Button>,
                    ]}
                  />
                )}

                <Drawer
                  title={
                    editingRecord
                      ? 'Edit Estimasi Sample'
                      : 'Tambah Estimasi Sample Baru'
                  }
                  width={600}
                  open={drawerVisible}
                  onClose={() => {
                    setDrawerVisible(false);
                    form.resetFields();
                  }}
                  extra={
                    <Space>
                      <Button onClick={() => setDrawerVisible(false)}>
                        Batal
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => form.submit()}
                        style={{
                          backgroundColor: '#fd0017',
                          borderColor: '#fd0017',
                        }}
                      >
                        Simpan
                      </Button>
                    </Space>
                  }
                >
                  <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                      name="sample_type"
                      label="Jenis Product" // Changed from "Jenis Sample"
                      rules={[
                        {
                          required: true,
                          message: 'Jenis product wajib dipilih',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Pilih jenis product"
                        options={productTypeOptions}
                      />
                    </Form.Item>

                    <Form.Item
                      name="vessel_name"
                      label="Kapal"
                      rules={[
                        { required: true, message: 'Kapal wajib dipilih' },
                      ]}
                    >
                      <Select
                        placeholder="Pilih kapal"
                        options={vesselOptions}
                      />
                    </Form.Item>

                    <Form.Item
                      name="tank_number"
                      label="Nomor Tangki"
                      rules={[
                        {
                          required: true,
                          message: 'Nomor tangki wajib dipilih',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Pilih nomor tangki"
                        options={tankNumberOptions}
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="quantity"
                          label="Kuantitas"
                          rules={[
                            {
                              required: true,
                              message: 'Kuantitas wajib diisi',
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            placeholder="25"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="unit"
                          label="Satuan"
                          rules={[
                            { required: true, message: 'Satuan wajib diisi' },
                          ]}
                        >
                          <Select placeholder="Pilih satuan">
                            <Select.Option value="botol">Botol</Select.Option>
                            <Select.Option value="liter">Liter</Select.Option>
                            <Select.Option value="ml">ml</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="received_date"
                      label="Tanggal Diterima"
                      rules={[
                        {
                          required: true,
                          message: 'Tanggal diterima wajib diisi',
                        },
                      ]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                      name="status"
                      label="Status"
                      rules={[
                        { required: true, message: 'Status wajib dipilih' },
                      ]}
                    >
                      <Select placeholder="Pilih status">
                        <Select.Option value="available">
                          Tersedia
                        </Select.Option>
                        <Select.Option value="low">Terbatas</Select.Option>
                        <Select.Option value="urgent">Urgent</Select.Option>{' '}
                        {/* Changed from "Kritis" */}
                        {/* Removed "Status Terpakai" option as per requirement */}
                      </Select>
                    </Form.Item>

                    <Form.Item name="notes" label="Catatan">
                      <Input.TextArea
                        rows={3}
                        placeholder="Catatan tambahan mengenai estimasi sample..."
                      />
                    </Form.Item>
                  </Form>
                </Drawer>
              </div>
            ),
          },
        ]}
      />

      <StadisManagement
        visible={stadisDrawerVisible}
        onClose={() => {
          setStadisDrawerVisible(false);
          setSelectedStadis(undefined);
        }}
        stadisData={selectedStadis}
        onUpdate={handleStadisUpdate}
      />
    </PageContainer>
  );
};

export default SampleEstimation;
