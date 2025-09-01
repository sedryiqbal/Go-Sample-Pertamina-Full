import {
  ExclamationCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Modal,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

const { TextArea } = Input;

interface RequestOrderRecord {
  id: string;
  request_number: string;
  customer_name: string;
  vessel_name: string;
  tank_number: string;
  sample_type: string;
  quantity_requested: number;
  priority: 'normal' | 'urgent' | 'critical';
  request_date: string;
  required_date: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  notes?: string;
  created_by: string;
  created_at: string;
}

const RequestOrder: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<
    RequestOrderRecord | undefined
  >();
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();

  const priorityOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Urgent', value: 'urgent' },
    { label: 'Critical', value: 'critical' },
  ];

  const sampleTypeOptions = [
    { label: 'JET A-1', value: 'jet-a1' },
    { label: 'Avgas', value: 'avgas' },
    { label: 'Diesel', value: 'diesel' },
    { label: 'Gasoline', value: 'gasoline' },
  ];

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Processing', value: 'processing' },
    { label: 'Completed', value: 'completed' },
    { label: 'Rejected', value: 'rejected' },
  ];

  const handleAdd = () => {
    setEditingRecord(undefined);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: RequestOrderRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      request_date: dayjs(record.request_date),
      required_date: dayjs(record.required_date),
    });
    setDrawerVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord) {
        message.success('Request order berhasil diperbarui');
      } else {
        message.success('Request order berhasil ditambahkan');
      }
      setDrawerVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan request order');
    }
  };

  const handleStatusUpdate = (
    record: RequestOrderRecord,
    newStatus: string,
  ) => {
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
      case 'pending':
        return 'default';
      case 'approved':
        return 'processing';
      case 'processing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'approved':
        return 'Disetujui';
      case 'processing':
        return 'Diproses';
      case 'completed':
        return 'Selesai';
      case 'rejected':
        return 'Ditolak';
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

  const columns: ProColumns<RequestOrderRecord>[] = [
    {
      title: 'Request Number',
      dataIndex: 'request_number',
      key: 'request_number',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.request_number}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {dayjs(record.request_date).format('DD/MM/YYYY')}
          </span>
        </Space>
      ),
    },
    {
      title: 'Customer Info',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customer_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.vessel_name} • {record.tank_number}
          </div>
        </div>
      ),
    },
    {
      title: 'Sample Details',
      dataIndex: 'sample_type',
      key: 'sample_type',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.sample_type}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Qty: {record.quantity_requested} L
          </div>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (_, record) => (
        <Tag
          color={getPriorityColor(record.priority)}
          icon={
            record.priority === 'critical' ? (
              <ExclamationCircleOutlined />
            ) : undefined
          }
        >
          {record.priority.toUpperCase()}
        </Tag>
      ),
      filters: priorityOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Required Date',
      dataIndex: 'required_date',
      key: 'required_date',
      valueType: 'date',
      sorter: true,
      render: (_, record) => {
        const isUrgent = dayjs(record.required_date).diff(dayjs(), 'days') <= 3;
        return (
          <span style={{ color: isUrgent ? '#ff4d4f' : undefined }}>
            {dayjs(record.required_date).format('DD/MM/YYYY')}
            {isUrgent && ' (URGENT)'}
          </span>
        );
      },
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
      title: 'Created By',
      dataIndex: 'created_by',
      key: 'created_by',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleStatusUpdate(record, 'approved')}
            disabled={
              record.status === 'completed' || record.status === 'rejected'
            }
          >
            Approve
          </Button>
        </Space>
      ),
    },
  ];

  const mockData: RequestOrderRecord[] = [
    {
      id: '1',
      request_number: 'RQ-20250901-001',
      customer_name: 'PT. Garuda Indonesia',
      vessel_name: 'Fuel Truck A',
      tank_number: 'FT-001',
      sample_type: 'JET A-1',
      quantity_requested: 500,
      priority: 'critical',
      request_date: '2025-09-01',
      required_date: '2025-09-03',
      status: 'pending',
      notes: 'Urgent request for flight operations',
      created_by: 'Admin User',
      created_at: '2025-09-01T08:00:00Z',
    },
    {
      id: '2',
      request_number: 'RQ-20250901-002',
      customer_name: 'PT. Lion Air',
      vessel_name: 'Fuel Truck B',
      tank_number: 'FT-002',
      sample_type: 'JET A-1',
      quantity_requested: 750,
      priority: 'urgent',
      request_date: '2025-09-01',
      required_date: '2025-09-05',
      status: 'approved',
      created_by: 'Lab Manager',
      created_at: '2025-09-01T09:30:00Z',
    },
    {
      id: '3',
      request_number: 'RQ-20250831-001',
      customer_name: 'PT. Citilink',
      vessel_name: 'Fuel Truck C',
      tank_number: 'FT-003',
      sample_type: 'Avgas',
      quantity_requested: 300,
      priority: 'normal',
      request_date: '2025-08-31',
      required_date: '2025-09-10',
      status: 'processing',
      created_by: 'Operator',
      created_at: '2025-08-31T14:00:00Z',
    },
  ];

  const summaryData = {
    total: mockData.length,
    pending: mockData.filter((item) => item.status === 'pending').length,
    approved: mockData.filter((item) => item.status === 'approved').length,
    processing: mockData.filter((item) => item.status === 'processing').length,
    critical: mockData.filter((item) => item.priority === 'critical').length,
  };

  return (
    <PageContainer
      title="Request Order"
      content="Kelola permintaan order sample dari customer dengan sistem prioritas"
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Requests"
              value={summaryData.total}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending Approval"
              value={summaryData.pending}
              prefix={
                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
              }
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="In Processing"
              value={summaryData.processing}
              prefix={<SearchOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Critical Priority"
              value={summaryData.critical}
              prefix={
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
              }
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <ProTable<RequestOrderRecord>
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
        headerTitle="Daftar Request Order"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
          >
            Tambah Request
          </Button>,
          <Button key="export" type="default">
            Export Excel
          </Button>,
        ]}
      />

      <Drawer
        title={editingRecord ? 'Edit Request Order' : 'Tambah Request Order'}
        width={600}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setEditingRecord(undefined);
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customer_name"
                label="Nama Customer"
                rules={[
                  { required: true, message: 'Nama customer wajib diisi' },
                ]}
              >
                <Input placeholder="Masukkan nama customer" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vessel_name"
                label="Nama Vessel/Truck"
                rules={[{ required: true, message: 'Nama vessel wajib diisi' }]}
              >
                <Input placeholder="Masukkan nama vessel" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tank_number"
                label="Nomor Tank"
                rules={[{ required: true, message: 'Nomor tank wajib diisi' }]}
              >
                <Input placeholder="Masukkan nomor tank" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sample_type"
                label="Jenis Sample"
                rules={[
                  { required: true, message: 'Jenis sample wajib dipilih' },
                ]}
              >
                <Select
                  placeholder="Pilih jenis sample"
                  options={sampleTypeOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity_requested"
                label="Quantity (L)"
                rules={[{ required: true, message: 'Quantity wajib diisi' }]}
              >
                <Input type="number" placeholder="Masukkan quantity" />
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="request_date"
                label="Tanggal Request"
                rules={[
                  { required: true, message: 'Tanggal request wajib diisi' },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Pilih tanggal request"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="required_date"
                label="Tanggal Dibutuhkan"
                rules={[
                  { required: true, message: 'Tanggal dibutuhkan wajib diisi' },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Pilih tanggal dibutuhkan"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Catatan">
            <TextArea rows={4} placeholder="Masukkan catatan tambahan..." />
          </Form.Item>

          {editingRecord && (
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Status wajib dipilih' }]}
            >
              <Select placeholder="Pilih status" options={statusOptions} />
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default RequestOrder;
