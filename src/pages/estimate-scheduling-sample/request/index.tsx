import {
  CarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
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
  Modal,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Tag,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

interface RequestOrderRecord {
  id: string;
  request_number: string;
  vessel_name: string;
  tank_number: string;
  sample_type: string;
  category: 'import' | 'local' | 'reference';
  quantity: number;
  unit: string;
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
  memo_file?: string;
  photo_file?: string;
  notes?: string;
  created_at: string;
  pickup_time?: string;
  delivery_time?: string;
  current_location?: string;
}

const RequestOrder: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<
    RequestOrderRecord | undefined
  >();
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();

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

  const handleAdd = () => {
    setEditingRecord(undefined);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: RequestOrderRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      estimated_arrival: record.estimated_arrival
        ? dayjs(record.estimated_arrival)
        : null,
    });
    setDrawerVisible(true);
  };

  const handleDelete = (record: RequestOrderRecord) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus',
      content: `Apakah Anda yakin ingin menghapus request ${record.request_number}?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk() {
        message.success(`Request ${record.request_number} berhasil dihapus`);
        actionRef.current?.reload();
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const requestNumber = `RQ-${dayjs().format('YYYYMMDD')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const labLocation = labLocationOptions.find(
        (lab) => lab.value === values.lab_location,
      );

      const _requestData = {
        ...values,
        request_number: requestNumber,
        estimated_arrival: values.estimated_arrival?.format('YYYY-MM-DD HH:mm'),
        estimated_delivery_time: labLocation?.time || 1,
        status: 'pending',
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      if (editingRecord) {
        message.success('Request berhasil diperbarui');
      } else {
        message.success(
          `Request berhasil dibuat dengan nomor: ${requestNumber}`,
        );
      }

      setDrawerVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan request');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'import':
        return 'blue';
      case 'local':
        return 'green';
      case 'reference':
        return 'purple';
      default:
        return 'default';
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

  const columns: ProColumns<RequestOrderRecord>[] = [
    {
      title: 'No. Request',
      dataIndex: 'request_number',
      key: 'request_number',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.request_number}</span>
          <Tag color={getPriorityColor(record.priority)} size="small">
            {record.priority.toUpperCase()}
          </Tag>
        </Space>
      ),
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
          <Tag color={getCategoryColor(record.category)} size="small">
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

  const mockData: RequestOrderRecord[] = [
    {
      id: '1',
      request_number: 'RQ-20250806-001',
      vessel_name: 'MT. Commodore One',
      tank_number: 'T.107',
      sample_type: 'JET A-1',
      category: 'import',
      quantity: 4,
      unit: 'botol',
      company_sender: 'SHAFTI',
      sender_name: 'Moch. Aby Gazal',
      sender_phone: '+62-21-12345678',
      estimated_arrival: '2025-08-06 10:00',
      lab_location: 'LPUJ - Priok',
      estimated_delivery_time: 1,
      priority: 'urgent',
      status: 'in_transit',
      sample_officer: 'Moch. Aby Gazal',
      created_at: '2025-08-06 08:30:00',
      pickup_time: '2025-08-06 09:00:00',
      memo_file: 'memo_227_NPC_SKH_2025.pdf',
      photo_file: 'sample_photo_001.jpg',
      notes: 'Sampel untuk pengujian segera',
    },
    {
      id: '2',
      request_number: 'RQ-20250806-002',
      vessel_name: 'MT. Pioneer',
      tank_number: 'T.203',
      sample_type: 'Avgas',
      category: 'local',
      quantity: 3,
      unit: 'botol',
      company_sender: 'Southeast Aviation',
      sender_name: 'Ahmad Rahman',
      sender_phone: '+60-12345678',
      estimated_arrival: '2025-08-06 14:00',
      lab_location: 'Lemigas - Jakarta',
      estimated_delivery_time: 1,
      priority: 'normal',
      status: 'confirmed',
      sample_officer: 'Ahmad Santoso',
      created_at: '2025-08-06 10:15:00',
      notes: 'Request dari partner Malaysia',
    },
  ];

  const requestSummary = {
    total: mockData.length,
    pending: mockData.filter((item) => item.status === 'pending').length,
    in_progress: mockData.filter((item) =>
      ['confirmed', 'picked_up', 'in_transit'].includes(item.status),
    ).length,
    delivered: mockData.filter((item) => item.status === 'delivered').length,
  };

  return (
    <PageContainer
      title="Pemesanan Request"
      content="Input langsung data sampel baru dengan detail pengirim dan estimasi kedatangan"
      extra={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          Buat Request Baru
        </Button>,
      ]}
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Request"
              value={requestSummary.total}
              prefix={<FormOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={requestSummary.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Dalam Proses"
              value={requestSummary.in_progress}
              prefix={<CarOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Terkirim"
              value={requestSummary.delivered}
              prefix={<ShoppingOutlined style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017' }}
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
        headerTitle="Daftar Request"
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

      <Drawer
        title={editingRecord ? 'Edit Request' : 'Buat Request Baru'}
        width={700}
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
              Buat Request
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Sample Information */}
          <Card
            title="Informasi Sampel"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="vessel_name"
                  label="Nama Kapal/Tangki"
                  rules={[
                    { required: true, message: 'Nama kapal wajib diisi' },
                  ]}
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
          </Card>

          {/* Delivery Information */}
          <Card
            title="Informasi Pengiriman"
            size="small"
            style={{ marginBottom: 16 }}
          >
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
                    onChange={(value) => {
                      const lab = labLocationOptions.find(
                        (lab) => lab.value === value,
                      );
                      if (lab) {
                        form.setFieldsValue({
                          estimated_delivery_time: lab.time,
                        });
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
              </Col>
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
            </Row>
          </Card>

          {/* File Attachments */}
          <Card title="Lampiran" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="memo_file"
                  label="Memo File"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    name="memo"
                    listType="text"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>Upload Memo</Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="photo_file"
                  label="Foto Sampel"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    name="photo"
                    listType="picture"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>Upload Foto</Button>
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

          {/* Process Information */}
          <Card title="Informasi Proses" size="small">
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                Contoh Format Google Form:
              </div>
              <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
                • Tanggal: 05 Agustus 2025
                <br />• Nomor Permintaan: 227/NPC/SKH/2025
                <br />• Nama Kapal/Tangki: MT. Commodore One/T.107
                <br />• Jumlah Sample: 4 Botol
                <br />• Jenis Sampel: JET A-1
                <br />• Perusahaan Pengirim: SHAFTI
                <br />• Nama Pengirim: Moch. Aby Gazal
                <br />• Estimasi Kedatangan: 10:00 AM
              </div>
            </div>

            <Steps
              size="small"
              current={0}
              items={[
                {
                  title: 'Registrasi',
                  description: 'Request dibuat',
                },
                {
                  title: 'Konfirmasi',
                  description: 'Request dikonfirmasi',
                },
                {
                  title: 'Pengambilan',
                  description: 'Sampel diambil',
                },
                {
                  title: 'Pengiriman',
                  description: 'Sampai di lab',
                },
              ]}
            />
          </Card>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default RequestOrder;
