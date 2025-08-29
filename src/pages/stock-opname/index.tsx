import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ScanOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
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
  Tabs,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

interface StockOpnameRecord {
  id: string;
  sample_id: string;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  location: string;
  lab_location: string;
  received_date: string;
  expiry_date: string;
  initial_quantity: number;
  current_quantity: number;
  used_quantity: number;
  unit: string;
  status: 'available' | 'in_use' | 'used' | 'expired' | 'damaged' | 'returned';
  condition: 'good' | 'fair' | 'poor' | 'damaged';
  last_usage: string;
  storage_location: string;
  temperature: string;
  humidity: string;
  notes?: string;
  lab_technician?: string;
  created_at: string;
  updated_at: string;
}

const StockOpname: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [modalVisible, setModalVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<
    StockOpnameRecord | undefined
  >();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [scanForm] = Form.useForm();

  const statusOptions = [
    { label: 'Available', value: 'available' },
    { label: 'In Use', value: 'in_use' },
    { label: 'Used', value: 'used' },
    { label: 'Expired', value: 'expired' },
    { label: 'Damaged', value: 'damaged' },
    { label: 'Returned', value: 'returned' },
  ];

  const conditionOptions = [
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
    { label: 'Poor', value: 'poor' },
    { label: 'Damaged', value: 'damaged' },
  ];

  const _labLocationOptions = [
    { label: 'LPUJ - Priok', value: 'lpuj-priok' },
    { label: 'Lemigas - Jakarta', value: 'lemigas-jakarta' },
    { label: 'Balongan - Balongan', value: 'balongan' },
  ];

  const handleEdit = (record: StockOpnameRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      received_date: record.received_date ? dayjs(record.received_date) : null,
      expiry_date: record.expiry_date ? dayjs(record.expiry_date) : null,
    });
    setModalVisible(true);
  };

  const handleScanUpdate = () => {
    setScanModalVisible(true);
    scanForm.resetFields();
  };

  const handleSubmit = async (_values: any) => {
    try {
      if (editingRecord) {
        message.success('Stock opname berhasil diperbarui');
      } else {
        message.success('Record stock opname berhasil ditambahkan');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingRecord(undefined);
      actionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan data stock opname');
    }
  };

  const handleScanSubmit = async (values: any) => {
    try {
      message.success(
        `Sample ${values.sample_id} berhasil di-scan dan diperbarui`,
      );
      setScanModalVisible(false);
      scanForm.resetFields();
      actionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal melakukan scan update');
    }
  };

  const handleBulkAction = (
    action: string,
    selectedRows: StockOpnameRecord[],
  ) => {
    Modal.confirm({
      title: `${action} Selected Items`,
      content: `Apakah Anda yakin ingin ${action.toLowerCase()} ${selectedRows.length} item(s)?`,
      onOk() {
        message.success(
          `${selectedRows.length} item(s) berhasil di-${action.toLowerCase()}`,
        );
        actionRef.current?.reload();
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'in_use':
        return 'processing';
      case 'used':
        return 'default';
      case 'expired':
        return 'warning';
      case 'damaged':
        return 'error';
      case 'returned':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia';
      case 'in_use':
        return 'Sedang Digunakan';
      case 'used':
        return 'Telah Digunakan';
      case 'expired':
        return 'Kedaluwarsa';
      case 'damaged':
        return 'Rusak';
      case 'returned':
        return 'Dikembalikan';
      default:
        return status;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good':
        return 'success';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'error';
      case 'damaged':
        return 'error';
      default:
        return 'default';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'good':
        return 'Baik';
      case 'fair':
        return 'Cukup';
      case 'poor':
        return 'Buruk';
      case 'damaged':
        return 'Rusak';
      default:
        return condition;
    }
  };

  const columns: ProColumns<StockOpnameRecord>[] = [
    {
      title: 'Sample ID',
      dataIndex: 'sample_id',
      key: 'sample_id',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.sample_id}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {record.sample_type}
          </span>
        </Space>
      ),
    },
    {
      title: 'Detail Sampel',
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
      title: 'Lokasi',
      dataIndex: 'lab_location',
      key: 'lab_location',
      render: (_, record) => (
        <div>
          <div>{record.lab_location}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.storage_location}
          </div>
        </div>
      ),
    },
    {
      title: 'Kuantitas',
      dataIndex: 'current_quantity',
      key: 'current_quantity',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.current_quantity}/{record.initial_quantity} {record.unit}
          </div>
          <Progress
            percent={Math.round(
              (record.current_quantity / record.initial_quantity) * 100,
            )}
            size="small"
            strokeColor={record.current_quantity > 0 ? '#9fe400' : '#fd0017'}
          />
          <div style={{ fontSize: '11px', color: '#666' }}>
            Digunakan: {record.used_quantity} {record.unit}
          </div>
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
      filters: statusOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Kondisi',
      dataIndex: 'condition',
      key: 'condition',
      render: (_, record) => (
        <Badge
          status={getConditionColor(record.condition)}
          text={getConditionLabel(record.condition)}
        />
      ),
      filters: conditionOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Tanggal Kadaluwarsa',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (_, record) => {
        const isExpired = dayjs().isAfter(dayjs(record.expiry_date));
        const isNearExpiry = dayjs()
          .add(7, 'day')
          .isAfter(dayjs(record.expiry_date));
        return (
          <div>
            <div
              style={{
                color: isExpired
                  ? '#fd0017'
                  : isNearExpiry
                    ? '#faad14'
                    : '#666',
              }}
            >
              {dayjs(record.expiry_date).format('DD/MM/YYYY')}
            </div>
            {isExpired && (
              <Tag color="error" size="small">
                Expired
              </Tag>
            )}
            {!isExpired && isNearExpiry && (
              <Tag color="warning" size="small">
                Near Expiry
              </Tag>
            )}
          </div>
        );
      },
      sorter: true,
    },
    {
      title: 'Kondisi Storage',
      dataIndex: 'temperature',
      key: 'storage_condition',
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>Temp: {record.temperature}</div>
          <div>Humidity: {record.humidity}</div>
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
            icon={<ScanOutlined />}
            onClick={() => {
              scanForm.setFieldsValue({ sample_id: record.sample_id });
              setScanModalVisible(true);
            }}
          >
            Scan
          </Button>
        </Space>
      ),
    },
  ];

  const mockData: StockOpnameRecord[] = [
    {
      id: '1',
      sample_id: 'SMPL-20250806-001',
      sample_type: 'JET A-1',
      vessel_name: 'MT. Commodore One',
      tank_number: 'T.107',
      location: 'SHAFTI',
      lab_location: 'LPUJ - Priok',
      received_date: '2025-08-05',
      expiry_date: '2025-09-05',
      initial_quantity: 4,
      current_quantity: 2,
      used_quantity: 2,
      unit: 'botol',
      status: 'in_use',
      condition: 'good',
      last_usage: '2025-08-06 10:00:00',
      storage_location: 'Refrigerator A-1',
      temperature: '4°C',
      humidity: '65%',
      lab_technician: 'Dr. Ahmad Lab',
      created_at: '2025-08-05 10:00:00',
      updated_at: '2025-08-06 14:30:00',
    },
    {
      id: '2',
      sample_id: 'SMPL-20250806-002',
      sample_type: 'Avgas',
      vessel_name: 'MT. Pioneer',
      tank_number: 'T.203',
      location: 'SHAFTI',
      lab_location: 'Lemigas - Jakarta',
      received_date: '2025-08-04',
      expiry_date: '2025-08-11',
      initial_quantity: 3,
      current_quantity: 0,
      used_quantity: 3,
      unit: 'botol',
      status: 'used',
      condition: 'good',
      last_usage: '2025-08-06 15:00:00',
      storage_location: 'Storage B-2',
      temperature: 'RT',
      humidity: '60%',
      lab_technician: 'Ir. Budi Santoso',
      notes: 'Sampel habis digunakan untuk pengujian lengkap',
      created_at: '2025-08-04 11:00:00',
      updated_at: '2025-08-06 15:00:00',
    },
    {
      id: '3',
      sample_id: 'SMPL-20250803-001',
      sample_type: 'Diesel',
      vessel_name: 'MT. Explorer',
      tank_number: 'T.301',
      location: 'SHAFTI',
      lab_location: 'Balongan Testing Center',
      received_date: '2025-08-03',
      expiry_date: '2025-08-10',
      initial_quantity: 5,
      current_quantity: 1,
      used_quantity: 4,
      unit: 'botol',
      status: 'available',
      condition: 'fair',
      last_usage: '2025-08-05 16:00:00',
      storage_location: 'Storage C-1',
      temperature: 'RT',
      humidity: '55%',
      lab_technician: 'Drs. Cahaya Wijaya',
      notes: 'Akan segera kadaluwarsa dalam 2 hari',
      created_at: '2025-08-03 09:00:00',
      updated_at: '2025-08-05 16:00:00',
    },
  ];

  // Calculate summary statistics
  const summary = {
    total: mockData.length,
    available: mockData.filter((item) => item.status === 'available').length,
    in_use: mockData.filter((item) => item.status === 'in_use').length,
    used: mockData.filter((item) => item.status === 'used').length,
    expired: mockData.filter(
      (item) =>
        item.status === 'expired' || dayjs().isAfter(dayjs(item.expiry_date)),
    ).length,
    near_expiry: mockData.filter((item) => {
      const isNearExpiry = dayjs()
        .add(7, 'day')
        .isAfter(dayjs(item.expiry_date));
      const isExpired = dayjs().isAfter(dayjs(item.expiry_date));
      return isNearExpiry && !isExpired;
    }).length,
    total_initial: mockData.reduce(
      (sum, item) => sum + item.initial_quantity,
      0,
    ),
    total_current: mockData.reduce(
      (sum, item) => sum + item.current_quantity,
      0,
    ),
    total_used: mockData.reduce((sum, item) => sum + item.used_quantity, 0),
  };

  const tabItems = [
    {
      key: 'inventory',
      label: 'Inventory Overview',
      children: (
        <div>
          {/* Alerts */}
          {summary.expired > 0 && (
            <Alert
              message={`${summary.expired} sampel telah kedaluwarsa`}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              action={
                <Button size="small" danger>
                  Lihat Detail
                </Button>
              }
            />
          )}

          {summary.near_expiry > 0 && (
            <Alert
              message={`${summary.near_expiry} sampel akan kedaluwarsa dalam 7 hari`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              action={<Button size="small">Lihat Detail</Button>}
            />
          )}

          <ProTable<StockOpnameRecord>
            actionRef={actionRef}
            rowKey="id"
            search={{
              labelWidth: 'auto',
            }}
            columns={columns}
            dataSource={mockData}
            rowSelection={{
              onChange: (selectedRowKeys, selectedRows) => {
                console.log('Selected:', selectedRowKeys, selectedRows);
              },
            }}
            tableAlertRender={({
              selectedRowKeys,
              selectedRows,
              onCleanSelected,
            }) => (
              <Space>
                <span>Dipilih {selectedRowKeys.length} item</span>
                <Button size="small" onClick={onCleanSelected}>
                  Batal Pilih
                </Button>
              </Space>
            )}
            tableAlertOptionRender={({ selectedRows }) => (
              <Space>
                <Button
                  size="small"
                  onClick={() =>
                    handleBulkAction('Update Status', selectedRows)
                  }
                >
                  Update Status
                </Button>
                <Button
                  size="small"
                  onClick={() => handleBulkAction('Mark as Used', selectedRows)}
                >
                  Mark as Used
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() =>
                    handleBulkAction('Mark as Damaged', selectedRows)
                  }
                >
                  Mark as Damaged
                </Button>
              </Space>
            )}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            dateFormatter="string"
            headerTitle="Stock Opname Sampel"
            toolBarRender={() => [
              <Button
                key="scan"
                icon={<ScanOutlined />}
                onClick={handleScanUpdate}
              >
                Scan Update
              </Button>,
              <Button key="export" type="default">
                Export Excel
              </Button>,
            ]}
          />
        </div>
      ),
    },
    {
      key: 'analytics',
      label: 'Analytics',
      children: (
        <Card title="Stock Analytics">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Usage Rate"
                  value={Math.round(
                    (summary.total_used / summary.total_initial) * 100,
                  )}
                  suffix="%"
                  valueStyle={{ color: '#9fe400' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Waste Rate"
                  value={Math.round((summary.expired / summary.total) * 100)}
                  suffix="%"
                  valueStyle={{ color: '#fd0017' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Efficiency"
                  value={Math.round(
                    (summary.total_used /
                      (summary.total_used + summary.expired || 1)) *
                      100,
                  )}
                  suffix="%"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      ),
    },
  ];

  return (
    <PageContainer
      title="Stock Opname Sample"
      content="Tracking dan manajemen inventaris sampel di laboratorium dengan monitoring real-time"
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Total Sampel"
              value={summary.total}
              prefix={<DatabaseOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Tersedia"
              value={summary.available}
              prefix={<CheckCircleOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Sedang Digunakan"
              value={summary.in_use}
              prefix={<ScanOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Habis Digunakan"
              value={summary.used}
              prefix={<CloseCircleOutlined style={{ color: '#999' }} />}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Akan Expired"
              value={summary.near_expiry}
              prefix={
                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
              }
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={4}>
          <Card>
            <Statistic
              title="Expired"
              value={summary.expired}
              prefix={
                <ExclamationCircleOutlined style={{ color: '#fd0017' }} />
              }
              valueStyle={{ color: '#fd0017' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      {/* Edit Modal */}
      <Modal
        title={editingRecord ? 'Edit Stock Opname' : 'Tambah Stock Opname'}
        width={600}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingRecord(undefined);
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="current_quantity"
                label="Kuantitas Saat Ini"
                rules={[
                  { required: true, message: 'Kuantitas saat ini wajib diisi' },
                ]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="used_quantity"
                label="Kuantitas Digunakan"
                rules={[
                  {
                    required: true,
                    message: 'Kuantitas digunakan wajib diisi',
                  },
                ]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Status wajib dipilih' }]}
              >
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="condition"
                label="Kondisi"
                rules={[{ required: true, message: 'Kondisi wajib dipilih' }]}
              >
                <Select options={conditionOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="temperature" label="Temperature">
                <Input placeholder="4°C / RT" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="humidity" label="Humidity">
                <Input placeholder="65%" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="storage_location" label="Lokasi Penyimpanan">
            <Input placeholder="Refrigerator A-1" />
          </Form.Item>

          <Form.Item name="notes" label="Catatan">
            <Input.TextArea
              rows={3}
              placeholder="Catatan mengenai kondisi atau penggunaan sampel..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Scan Update Modal */}
      <Modal
        title="Scan Update Sample"
        open={scanModalVisible}
        onCancel={() => setScanModalVisible(false)}
        onOk={() => scanForm.submit()}
      >
        <Form form={scanForm} layout="vertical" onFinish={handleScanSubmit}>
          <Form.Item
            name="sample_id"
            label="Sample ID"
            rules={[{ required: true, message: 'Sample ID wajib diisi' }]}
          >
            <Input placeholder="Scan barcode atau input manual" />
          </Form.Item>

          <Form.Item
            name="action"
            label="Aksi"
            rules={[{ required: true, message: 'Aksi wajib dipilih' }]}
          >
            <Select placeholder="Pilih aksi">
              <Select.Option value="usage">Record Usage</Select.Option>
              <Select.Option value="return">Return to Storage</Select.Option>
              <Select.Option value="damage">Mark as Damaged</Select.Option>
              <Select.Option value="expire">Mark as Expired</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="quantity_used" label="Jumlah Digunakan">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="scan_notes" label="Catatan">
            <Input.TextArea rows={2} placeholder="Catatan hasil scan..." />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default StockOpname;
