import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Tag,
} from 'antd';
import React, { useRef, useState } from 'react';

interface CategoryRecord {
  id: string;
  name: string;
  code: string;
  type: 'fuel' | 'additive' | 'lubricant' | 'chemical';
  description: string;
  specifications: string;
  testing_parameters: string[];
  status: 'active' | 'inactive';
  created_at: string;
  sample_count: number;
}

const Categories: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<
    CategoryRecord | undefined
  >();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();

  const typeOptions = [
    { label: 'Fuel', value: 'fuel' },
    { label: 'Additive', value: 'additive' },
    { label: 'Lubricant', value: 'lubricant' },
    { label: 'Chemical', value: 'chemical' },
  ];

  const testingParameterOptions = [
    { label: 'Kadar Air', value: 'water_content' },
    { label: 'Viskositas', value: 'viscosity' },
    { label: 'Densitas', value: 'density' },
    { label: 'Flash Point', value: 'flash_point' },
    { label: 'Freeze Point', value: 'freeze_point' },
    { label: 'Sulfur Content', value: 'sulfur_content' },
    { label: 'Aromatics', value: 'aromatics' },
    { label: 'Cetane Index', value: 'cetane_index' },
    { label: 'Octane Number', value: 'octane_number' },
    { label: 'Thermal Stability', value: 'thermal_stability' },
  ];

  const handleAdd = () => {
    setEditingRecord(undefined);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: CategoryRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setDrawerVisible(true);
  };

  const handleDelete = (record: CategoryRecord) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus',
      content: `Apakah Anda yakin ingin menghapus kategori ${record.name}?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk() {
        message.success(`Kategori ${record.name} berhasil dihapus`);
        actionRef.current?.reload();
      },
    });
  };

  const handleSubmit = async (_values: any) => {
    try {
      if (editingRecord) {
        message.success('Kategori berhasil diperbarui');
      } else {
        message.success('Kategori berhasil ditambahkan');
      }
      setDrawerVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan data kategori');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fuel':
        return 'blue';
      case 'additive':
        return 'green';
      case 'lubricant':
        return 'orange';
      case 'chemical':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'fuel':
        return 'Fuel';
      case 'additive':
        return 'Additive';
      case 'lubricant':
        return 'Lubricant';
      case 'chemical':
        return 'Chemical';
      default:
        return type;
    }
  };

  const columns: ProColumns<CategoryRecord>[] = [
    {
      title: 'Nama Kategori',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <TagsOutlined style={{ color: '#fd0017' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.code}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tipe',
      dataIndex: 'type',
      key: 'type',
      render: (_, record) => (
        <Tag color={getTypeColor(record.type)}>{getTypeLabel(record.type)}</Tag>
      ),
      filters: typeOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Spesifikasi',
      dataIndex: 'specifications',
      key: 'specifications',
      ellipsis: true,
    },
    {
      title: 'Parameter Pengujian',
      dataIndex: 'testing_parameters',
      key: 'testing_parameters',
      render: (_, record) => (
        <div>
          {record.testing_parameters.slice(0, 2).map((param) => (
            <Tag key={param} size="small" style={{ marginBottom: 2 }}>
              {testingParameterOptions.find((opt) => opt.value === param)
                ?.label || param}
            </Tag>
          ))}
          {record.testing_parameters.length > 2 && (
            <Tag size="small" color="default">
              +{record.testing_parameters.length - 2} lainnya
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Jumlah Sampel',
      dataIndex: 'sample_count',
      key: 'sample_count',
      render: (_, record) => (
        <span style={{ fontWeight: 500 }}>{record.sample_count}</span>
      ),
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.status === 'active' ? 'success' : 'default'}>
          {record.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
        </Tag>
      ),
      filters: [
        { text: 'Aktif', value: 'active' },
        { text: 'Tidak Aktif', value: 'inactive' },
      ],
    },
    {
      title: 'Tanggal Dibuat',
      dataIndex: 'created_at',
      key: 'created_at',
      valueType: 'date',
      sorter: true,
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

  const mockData: CategoryRecord[] = [
    {
      id: '1',
      name: 'JET A-1',
      code: 'JA1',
      type: 'fuel',
      description: 'Aviation turbine fuel untuk pesawat komersial',
      specifications: 'ASTM D1655, DEF STAN 91-91',
      testing_parameters: [
        'water_content',
        'viscosity',
        'freeze_point',
        'flash_point',
        'aromatics',
      ],
      status: 'active',
      created_at: '2025-07-01',
      sample_count: 45,
    },
    {
      id: '2',
      name: 'Avgas',
      code: 'AVG',
      type: 'fuel',
      description: 'Aviation gasoline untuk pesawat piston',
      specifications: 'ASTM D910',
      testing_parameters: [
        'octane_number',
        'water_content',
        'density',
        'aromatics',
      ],
      status: 'active',
      created_at: '2025-07-01',
      sample_count: 23,
    },
    {
      id: '3',
      name: 'Diesel',
      code: 'DSL',
      type: 'fuel',
      description: 'Diesel fuel untuk kendaraan darat',
      specifications: 'ASTM D975, EN 590',
      testing_parameters: [
        'cetane_index',
        'sulfur_content',
        'water_content',
        'density',
        'viscosity',
      ],
      status: 'active',
      created_at: '2025-07-01',
      sample_count: 18,
    },
    {
      id: '4',
      name: 'Fuel Additive',
      code: 'ADD',
      type: 'additive',
      description: 'Aditif untuk meningkatkan performa bahan bakar',
      specifications: 'Custom specifications',
      testing_parameters: ['thermal_stability', 'water_content'],
      status: 'active',
      created_at: '2025-07-01',
      sample_count: 8,
    },
  ];

  const categorySummary = {
    total: mockData.length,
    active: mockData.filter((item) => item.status === 'active').length,
    totalSamples: mockData.reduce((sum, item) => sum + item.sample_count, 0),
    byType: typeOptions.map((type) => ({
      type: type.label,
      count: mockData.filter((item) => item.type === type.value).length,
    })),
  };

  return (
    <PageContainer
      title="Manajemen Kategori"
      content="Kelola kategori sampel dengan spesifikasi dan parameter pengujian yang sesuai"
      extra={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          Tambah Kategori
        </Button>,
      ]}
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Total Kategori"
              value={categorySummary.total}
              prefix={<TagsOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Kategori Aktif"
              value={categorySummary.active}
              prefix={<SettingOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Total Sampel"
              value={categorySummary.totalSamples}
              prefix={<TagsOutlined style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={6}>
          <Card title="Distribusi Tipe" size="small">
            {categorySummary.byType.map((item) => (
              <div
                key={item.type}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <span>{item.type}:</span>
                <span style={{ fontWeight: 500 }}>{item.count}</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <ProTable<CategoryRecord>
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
        headerTitle="Daftar Kategori"
        toolBarRender={() => [
          <Button key="export" type="default">
            Export Excel
          </Button>,
          <Button key="import" type="default">
            Import Template
          </Button>,
        ]}
      />

      <Drawer
        title={editingRecord ? 'Edit Kategori' : 'Tambah Kategori Baru'}
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
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Nama Kategori"
                rules={[
                  { required: true, message: 'Nama kategori wajib diisi' },
                ]}
              >
                <Input placeholder="JET A-1" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="code"
                label="Kode"
                rules={[{ required: true, message: 'Kode wajib diisi' }]}
              >
                <Input placeholder="JA1" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="type"
            label="Tipe"
            rules={[{ required: true, message: 'Tipe wajib dipilih' }]}
          >
            <Select placeholder="Pilih tipe" options={typeOptions} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Deskripsi"
            rules={[{ required: true, message: 'Deskripsi wajib diisi' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Deskripsi lengkap kategori sampel..."
            />
          </Form.Item>

          <Form.Item
            name="specifications"
            label="Spesifikasi"
            rules={[{ required: true, message: 'Spesifikasi wajib diisi' }]}
          >
            <Input.TextArea rows={2} placeholder="ASTM D1655, DEF STAN 91-91" />
          </Form.Item>

          <Form.Item
            name="testing_parameters"
            label="Parameter Pengujian"
            rules={[
              { required: true, message: 'Parameter pengujian wajib dipilih' },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Pilih parameter pengujian"
              options={testingParameterOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Aktif"
              unCheckedChildren="Tidak Aktif"
              style={{ backgroundColor: '#fd0017' }}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default Categories;
