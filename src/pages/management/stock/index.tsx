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
  Tag,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

interface StockRecord {
  id: string;
  sample_type: string;
  category: string;
  vessel_name: string;
  tank_number: string;
  quantity: number;
  unit: string;
  received_date: string;
  expiry_date: string;
  status: 'available' | 'low' | 'critical' | 'expired' | 'used';
  location: string;
  lab_location: string;
  estimated_time?: string;
  notes?: string;
}

const Stock: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StockRecord | undefined>();
  const [calendarView, setCalendarView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();

  const sampleTypeOptions = [
    { label: 'JET A-1', value: 'jet-a1' },
    { label: 'Avgas', value: 'avgas' },
    { label: 'Diesel', value: 'diesel' },
    { label: 'Gasoline', value: 'gasoline' },
  ];

  const categoryOptions = [
    { label: 'Import Sample', value: 'import' },
    { label: 'Local Sample', value: 'local' },
    { label: 'Reference Sample', value: 'reference' },
  ];

  const labLocationOptions = [
    { label: 'LPUJ - Priok (1 jam)', value: 'lpuj-priok' },
    { label: 'Lemigas - Jakarta (1 jam)', value: 'lemigas-jakarta' },
    { label: 'Balongan - Balongan (6 jam)', value: 'balongan' },
  ];

  const handleAdd = () => {
    setEditingRecord(undefined);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: StockRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      received_date: record.received_date ? dayjs(record.received_date) : null,
      expiry_date: record.expiry_date ? dayjs(record.expiry_date) : null,
    });
    setDrawerVisible(true);
  };

  const handleDelete = (record: StockRecord) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus',
      content: `Apakah Anda yakin ingin menghapus stock ${record.sample_type} dari ${record.vessel_name}?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk() {
        message.success(`Stock ${record.sample_type} berhasil dihapus`);
        actionRef.current?.reload();
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const _formattedValues = {
        ...values,
        received_date: values.received_date?.format('YYYY-MM-DD'),
        expiry_date: values.expiry_date?.format('YYYY-MM-DD'),
      };

      if (editingRecord) {
        message.success('Stock berhasil diperbarui');
      } else {
        message.success('Stock berhasil ditambahkan');
      }
      setDrawerVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan data stock');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'low':
        return 'warning';
      case 'critical':
        return 'error';
      case 'expired':
        return 'default';
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
      case 'critical':
        return 'Kritis';
      case 'expired':
        return 'Kedaluwarsa';
      case 'used':
        return 'Terpakai';
      default:
        return status;
    }
  };

  const columns: ProColumns<StockRecord>[] = [
    {
      title: 'Jenis Sampel',
      dataIndex: 'sample_type',
      key: 'sample_type',
      render: (_, record) => (
        <Space>
          <DatabaseOutlined style={{ color: '#fd0017' }} />
          <span style={{ fontWeight: 500 }}>{record.sample_type}</span>
        </Space>
      ),
      filters: sampleTypeOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (_, record) => <Tag color="blue">{record.category}</Tag>,
      filters: categoryOptions.map((item) => ({
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
      title: 'Tanggal Kedaluwarsa',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
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
        { text: 'Kritis', value: 'critical' },
        { text: 'Kedaluwarsa', value: 'expired' },
        { text: 'Terpakai', value: 'used' },
      ],
    },
    {
      title: 'Lokasi Lab',
      dataIndex: 'lab_location',
      key: 'lab_location',
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

  // Calendar data for stock estimation
  const getStockData = (value: Dayjs) => {
    const stockByDate: {
      [key: string]: Array<{
        type: 'success' | 'warning' | 'error';
        content: string;
      }>;
    } = {
      '2025-08-06': [
        { type: 'success', content: 'Stock Tersedia - JET A-1 (25 botol)' },
        { type: 'warning', content: 'Stock Terbatas - Avgas (5 botol)' },
      ],
      '2025-08-07': [
        { type: 'error', content: 'Stock Kosong - JET A-1' },
        { type: 'success', content: 'Stock Tersedia - Diesel (15 botol)' },
      ],
      '2025-08-08': [
        { type: 'success', content: 'Stock Tersedia - JET A-1 (30 botol)' },
        { type: 'success', content: 'Stock Tersedia - Avgas (12 botol)' },
      ],
      '2025-08-09': [
        { type: 'warning', content: 'Stock Terbatas - JET A-1 (8 botol)' },
        { type: 'error', content: 'Kedaluwarsa - Gasoline' },
      ],
      '2025-08-10': [
        { type: 'success', content: 'Stock Tersedia - JET A-1 (20 botol)' },
      ],
    };

    return stockByDate[value.format('YYYY-MM-DD')] || [];
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getStockData(value);
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
        {listData.map((item, index) => (
          <Badge
            key={`${item.type}-${item.content}-${index}`}
            status={item.type}
            text={item.content.split(' - ')[0]}
            style={{
              fontSize: '9px',
              display: 'block',
              marginBottom: '1px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          />
        ))}
      </div>
    );
  };

  const mockData: StockRecord[] = [
    {
      id: '1',
      sample_type: 'JET A-1',
      category: 'Import Sample',
      vessel_name: 'MT. Commodore One',
      tank_number: 'T.107',
      quantity: 25,
      unit: 'botol',
      received_date: '2025-08-05',
      expiry_date: '2025-09-05',
      status: 'available',
      location: 'SHAFTI',
      lab_location: 'LPUJ - Priok (1 jam)',
      notes: 'Sample dari kapal import untuk pengujian kualitas',
    },
    {
      id: '2',
      sample_type: 'Avgas',
      category: 'Local Sample',
      vessel_name: 'MT. Pioneer',
      tank_number: 'T.203',
      quantity: 5,
      unit: 'botol',
      received_date: '2025-08-04',
      expiry_date: '2025-09-04',
      status: 'low',
      location: 'SHAFTI',
      lab_location: 'Lemigas - Jakarta (1 jam)',
      notes: 'Stock menipis, perlu replenishment',
    },
    {
      id: '3',
      sample_type: 'Diesel',
      category: 'Import Sample',
      vessel_name: 'MT. Explorer',
      tank_number: 'T.301',
      quantity: 0,
      unit: 'botol',
      received_date: '2025-08-01',
      expiry_date: '2025-09-01',
      status: 'critical',
      location: 'SHAFTI',
      lab_location: 'Balongan - Balongan (6 jam)',
      notes: 'Stock habis, perlu pengisian ulang segera',
    },
  ];

  const stockSummary = {
    total: mockData.length,
    available: mockData.filter((item) => item.status === 'available').length,
    low: mockData.filter((item) => item.status === 'low').length,
    critical: mockData.filter((item) => item.status === 'critical').length,
  };

  return (
    <PageContainer
      title="Manajemen Stock"
      content="Kelola stok sampel dengan kalender estimasi ketersediaan dan tracking real-time"
      extra={[
        <Button
          key="calendar"
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
          Tambah Stock
        </Button>,
      ]}
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Stock"
              value={stockSummary.total}
              prefix={<DatabaseOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tersedia"
              value={stockSummary.available}
              prefix={<DatabaseOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Terbatas"
              value={stockSummary.low}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Kritis"
              value={stockSummary.critical}
              prefix={<WarningOutlined style={{ color: '#fd0017' }} />}
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
              Kalender Estimasi Ketersediaan Stock
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
        <ProTable<StockRecord>
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
          headerTitle="Daftar Stock"
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
        title={editingRecord ? 'Edit Stock' : 'Tambah Stock Baru'}
        width={600}
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
          <Form.Item
            name="sample_type"
            label="Jenis Sampel"
            rules={[{ required: true, message: 'Jenis sampel wajib dipilih' }]}
          >
            <Select
              placeholder="Pilih jenis sampel"
              options={sampleTypeOptions}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Kategori"
            rules={[{ required: true, message: 'Kategori wajib dipilih' }]}
          >
            <Select placeholder="Pilih kategori" options={categoryOptions} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vessel_name"
                label="Nama Kapal"
                rules={[{ required: true, message: 'Nama kapal wajib diisi' }]}
              >
                <Input placeholder="MT. Commodore One" />
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
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Kuantitas"
                rules={[{ required: true, message: 'Kuantitas wajib diisi' }]}
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
                rules={[{ required: true, message: 'Satuan wajib diisi' }]}
              >
                <Select placeholder="Pilih satuan">
                  <Select.Option value="botol">Botol</Select.Option>
                  <Select.Option value="liter">Liter</Select.Option>
                  <Select.Option value="ml">ml</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="received_date"
                label="Tanggal Diterima"
                rules={[
                  { required: true, message: 'Tanggal diterima wajib diisi' },
                ]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiry_date"
                label="Tanggal Kedaluwarsa"
                rules={[
                  {
                    required: true,
                    message: 'Tanggal kedaluwarsa wajib diisi',
                  },
                ]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="lab_location"
            label="Lokasi Lab & Estimasi Waktu"
            rules={[{ required: true, message: 'Lokasi lab wajib dipilih' }]}
          >
            <Select
              placeholder="Pilih lokasi lab"
              options={labLocationOptions}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Status wajib dipilih' }]}
          >
            <Select placeholder="Pilih status">
              <Select.Option value="available">Tersedia</Select.Option>
              <Select.Option value="low">Terbatas</Select.Option>
              <Select.Option value="critical">Kritis</Select.Option>
              <Select.Option value="expired">Kedaluwarsa</Select.Option>
              <Select.Option value="used">Terpakai</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Catatan">
            <Input.TextArea
              rows={3}
              placeholder="Catatan tambahan mengenai stock..."
            />
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default Stock;
