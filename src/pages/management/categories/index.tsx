import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message,
  Tag,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { useRef, useState } from 'react';

interface Category {
  id: string;
  name: string;
  code: string;
  type: 'fuel' | 'additive' | 'lubricant' | 'other';
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const Categories: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const columns: ProColumns<Category>[] = [
    {
      title: 'Kode',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      copyable: true,
    },
    {
      title: 'Nama Kategori',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Jenis',
      dataIndex: 'type',
      key: 'type',
      render: (_, record) => {
        const typeConfig = {
          fuel: { text: 'Bahan Bakar', color: 'blue' },
          additive: { text: 'Aditif', color: 'green' },
          lubricant: { text: 'Pelumas', color: 'orange' },
          other: { text: 'Lainnya', color: 'default' },
        };
        const config = typeConfig[record.type];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      valueEnum: {
        fuel: { text: 'Bahan Bakar', status: 'Processing' },
        additive: { text: 'Aditif', status: 'Success' },
        lubricant: { text: 'Pelumas', status: 'Warning' },
        other: { text: 'Lainnya', status: 'Default' },
      },
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.status === 'active' ? 'success' : 'default'}>
          {record.status === 'active' ? 'Aktif' : 'Nonaktif'}
        </Tag>
      ),
      valueEnum: {
        active: { text: 'Aktif', status: 'Success' },
        inactive: { text: 'Nonaktif', status: 'Default' },
      },
    },
    {
      title: 'Tanggal Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'dateTime',
      width: 180,
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Hapus kategori"
            description="Yakin ingin menghapus kategori ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setModalVisible(true);
  };

  const handleDelete = async (_id: string) => {
    try {
      message.success('Kategori berhasil dihapus');
      actionRef.current?.reload();
    } catch {
      message.error('Gagal menghapus kategori');
    }
  };

  const handleModalOk = async () => {
    try {
      await form.validateFields();
      
      if (editingCategory) {
        message.success('Kategori berhasil diperbarui');
      } else {
        message.success('Kategori berhasil ditambahkan');
      }
      
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  // Mock data request
  const fetchCategories = async () => {
    const mockData: Category[] = [
      {
        id: '1',
        name: 'JET A-1',
        code: 'JET01',
        type: 'fuel',
        description: 'Bahan bakar pesawat jet komersial',
        status: 'active',
        createdAt: '2025-01-01T08:00:00Z',
      },
      {
        id: '2',
        name: 'Avgas 100LL',
        code: 'AVG01',
        type: 'fuel',
        description: 'Bahan bakar pesawat mesin piston',
        status: 'active',
        createdAt: '2025-01-01T08:15:00Z',
      },
      {
        id: '3',
        name: 'Automotive Diesel',
        code: 'DSL01',
        type: 'fuel',
        description: 'Solar untuk kendaraan bermotor',
        status: 'active',
        createdAt: '2025-01-01T08:30:00Z',
      },
      {
        id: '4',
        name: 'Anti-icing Additive',
        code: 'ADD01',
        type: 'additive',
        description: 'Aditif anti-beku untuk bahan bakar',
        status: 'active',
        createdAt: '2025-01-01T09:00:00Z',
      },
      {
        id: '5',
        name: 'Engine Oil',
        code: 'OIL01',
        type: 'lubricant',
        description: 'Oli pelumas mesin pesawat',
        status: 'inactive',
        createdAt: '2024-12-15T10:00:00Z',
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
      title="Management Kategori"
      content="Kelola kategori produk untuk sistem pengujian sample"
    >
      <ProTable<Category>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={fetchCategories}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="Daftar Kategori"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Tambah Kategori
          </Button>,
        ]}
      />

      <Modal
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
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
            name="code"
            label="Kode Kategori"
            rules={[
              { required: true, message: 'Kode kategori wajib diisi' },
              { pattern: /^[A-Z0-9]+$/, message: 'Kode harus huruf kapital dan angka' }
            ]}
          >
            <Input placeholder="Contoh: JET01" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Nama Kategori"
            rules={[{ required: true, message: 'Nama kategori wajib diisi' }]}
          >
            <Input placeholder="Masukkan nama kategori" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Jenis"
            rules={[{ required: true, message: 'Jenis kategori wajib dipilih' }]}
          >
            <Select placeholder="Pilih jenis kategori">
              <Select.Option value="fuel">Bahan Bakar</Select.Option>
              <Select.Option value="additive">Aditif</Select.Option>
              <Select.Option value="lubricant">Pelumas</Select.Option>
              <Select.Option value="other">Lainnya</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Deskripsi"
            rules={[{ required: true, message: 'Deskripsi wajib diisi' }]}
          >
            <Input.TextArea 
              rows={3}
              placeholder="Masukkan deskripsi kategori"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Status wajib dipilih' }]}
          >
            <Select placeholder="Pilih status">
              <Select.Option value="active">Aktif</Select.Option>
              <Select.Option value="inactive">Nonaktif</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Categories;
