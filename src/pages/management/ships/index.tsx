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

interface Ship {
  id: string;
  name: string;
  code: string;
  type: 'cargo' | 'tanker' | 'passenger' | 'naval' | 'other';
  flag: string;
  capacity: number;
  unit: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastPort: string;
  createdAt: string;
}

const Ships: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingShip, setEditingShip] = useState<Ship | null>(null);

  const columns: ProColumns<Ship>[] = [
    {
      title: 'Kode Kapal',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      copyable: true,
    },
    {
      title: 'Nama Kapal',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Jenis Kapal',
      dataIndex: 'type',
      key: 'type',
      render: (_, record) => {
        const typeConfig = {
          cargo: { text: 'Kargo', color: 'blue' },
          tanker: { text: 'Tanker', color: 'orange' },
          passenger: { text: 'Penumpang', color: 'green' },
          naval: { text: 'Angkatan Laut', color: 'purple' },
          other: { text: 'Lainnya', color: 'default' },
        };
        const config = typeConfig[record.type];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      valueEnum: {
        cargo: { text: 'Kargo', status: 'Processing' },
        tanker: { text: 'Tanker', status: 'Warning' },
        passenger: { text: 'Penumpang', status: 'Success' },
        naval: { text: 'Angkatan Laut', status: 'Error' },
        other: { text: 'Lainnya', status: 'Default' },
      },
    },
    {
      title: 'Bendera',
      dataIndex: 'flag',
      key: 'flag',
      width: 100,
    },
    {
      title: 'Kapasitas',
      key: 'capacity',
      render: (_, record) => `${record.capacity.toLocaleString()} ${record.unit}`,
    },
    {
      title: 'Pelabuhan Terakhir',
      dataIndex: 'lastPort',
      key: 'lastPort',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const statusConfig = {
          active: { text: 'Aktif', color: 'success' },
          inactive: { text: 'Nonaktif', color: 'default' },
          maintenance: { text: 'Maintenance', color: 'warning' },
        };
        const config = statusConfig[record.status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      valueEnum: {
        active: { text: 'Aktif', status: 'Success' },
        inactive: { text: 'Nonaktif', status: 'Default' },
        maintenance: { text: 'Maintenance', status: 'Warning' },
      },
    },
    {
      title: 'Tanggal Didaftarkan',
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
            title="Hapus kapal"
            description="Yakin ingin menghapus data kapal ini?"
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
    setEditingShip(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (ship: Ship) => {
    setEditingShip(ship);
    form.setFieldsValue(ship);
    setModalVisible(true);
  };

  const handleDelete = async (_id: string) => {
    try {
      message.success('Data kapal berhasil dihapus');
      actionRef.current?.reload();
    } catch {
      message.error('Gagal menghapus data kapal');
    }
  };

  const handleModalOk = async () => {
    try {
      await form.validateFields();
      
      if (editingShip) {
        message.success('Data kapal berhasil diperbarui');
      } else {
        message.success('Data kapal berhasil ditambahkan');
      }
      
      setModalVisible(false);
      setEditingShip(null);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingShip(null);
    form.resetFields();
  };

  // Mock data request
  const fetchShips = async () => {
    const mockData: Ship[] = [
      {
        id: '1',
        name: 'MT Pertamina Prime',
        code: 'PPRI001',
        type: 'tanker',
        flag: 'Indonesia',
        capacity: 50000,
        unit: 'DWT',
        status: 'active',
        lastPort: 'Tanjung Priok',
        createdAt: '2025-01-15T08:00:00Z',
      },
      {
        id: '2',
        name: 'KM Sinar Bangun',
        code: 'SBAN002',
        type: 'cargo',
        flag: 'Indonesia',
        capacity: 25000,
        unit: 'DWT',
        status: 'active',
        lastPort: 'Surabaya',
        createdAt: '2025-01-10T10:30:00Z',
      },
      {
        id: '3',
        name: 'KRI Usman Harun',
        code: 'UH359',
        type: 'naval',
        flag: 'Indonesia',
        capacity: 2500,
        unit: 'Ton',
        status: 'maintenance',
        lastPort: 'Surabaya',
        createdAt: '2024-12-20T14:15:00Z',
      },
      {
        id: '4',
        name: 'MV Ocean Explorer',
        code: 'OEXP004',
        type: 'passenger',
        flag: 'Singapore',
        capacity: 1500,
        unit: 'Passengers',
        status: 'active',
        lastPort: 'Batam',
        createdAt: '2025-01-05T09:45:00Z',
      },
      {
        id: '5',
        name: 'Bulk Carrier Neptune',
        code: 'NEPT005',
        type: 'cargo',
        flag: 'Liberia',
        capacity: 80000,
        unit: 'DWT',
        status: 'inactive',
        lastPort: 'Balikpapan',
        createdAt: '2024-11-30T16:20:00Z',
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
      title="Management Kapal"
      content="Kelola data kapal untuk sistem pengujian sample"
    >
      <ProTable<Ship>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={fetchShips}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="Daftar Kapal"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Tambah Kapal
          </Button>,
        ]}
      />

      <Modal
        title={editingShip ? 'Edit Data Kapal' : 'Tambah Data Kapal'}
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
            label="Kode Kapal"
            rules={[
              { required: true, message: 'Kode kapal wajib diisi' },
              { pattern: /^[A-Z0-9]+$/, message: 'Kode harus huruf kapital dan angka' }
            ]}
          >
            <Input placeholder="Contoh: PPRI001" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Nama Kapal"
            rules={[{ required: true, message: 'Nama kapal wajib diisi' }]}
          >
            <Input placeholder="Masukkan nama kapal" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Jenis Kapal"
            rules={[{ required: true, message: 'Jenis kapal wajib dipilih' }]}
          >
            <Select placeholder="Pilih jenis kapal">
              <Select.Option value="cargo">Kargo</Select.Option>
              <Select.Option value="tanker">Tanker</Select.Option>
              <Select.Option value="passenger">Penumpang</Select.Option>
              <Select.Option value="naval">Angkatan Laut</Select.Option>
              <Select.Option value="other">Lainnya</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="flag"
            label="Bendera"
            rules={[{ required: true, message: 'Bendera wajib diisi' }]}
          >
            <Input placeholder="Contoh: Indonesia" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="capacity"
              label="Kapasitas"
              rules={[{ required: true, message: 'Kapasitas wajib diisi' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" placeholder="Masukkan kapasitas" />
            </Form.Item>

            <Form.Item
              name="unit"
              label="Satuan"
              rules={[{ required: true, message: 'Satuan wajib dipilih' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Pilih satuan">
                <Select.Option value="DWT">DWT</Select.Option>
                <Select.Option value="Ton">Ton</Select.Option>
                <Select.Option value="TEU">TEU</Select.Option>
                <Select.Option value="Passengers">Passengers</Select.Option>
                <Select.Option value="m³">m³</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="lastPort"
            label="Pelabuhan Terakhir"
            rules={[{ required: true, message: 'Pelabuhan terakhir wajib diisi' }]}
          >
            <Input placeholder="Masukkan nama pelabuhan terakhir" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Status wajib dipilih' }]}
          >
            <Select placeholder="Pilih status">
              <Select.Option value="active">Aktif</Select.Option>
              <Select.Option value="inactive">Nonaktif</Select.Option>
              <Select.Option value="maintenance">Maintenance</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Ships;
