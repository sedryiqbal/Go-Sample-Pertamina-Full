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
  Popconfirm,
  InputNumber
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { useRef, useState } from 'react';

interface Laboratory {
  id: string;
  name: string;
  code: string;
  location: string;
  type: 'internal' | 'external' | 'certified' | 'government';
  capacity: number;
  timeEstimate: number; // in hours
  contactPerson: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'maintenance';
  certification: string[];
  createdAt: string;
}

const Laboratories: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLab, setEditingLab] = useState<Laboratory | null>(null);

  const columns: ProColumns<Laboratory>[] = [
    {
      title: 'Kode Lab',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      copyable: true,
    },
    {
      title: 'Nama Laboratorium',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Lokasi',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Jenis',
      dataIndex: 'type',
      key: 'type',
      render: (_, record) => {
        const typeConfig = {
          internal: { text: 'Internal', color: 'blue' },
          external: { text: 'Eksternal', color: 'green' },
          certified: { text: 'Tersertifikasi', color: 'gold' },
          government: { text: 'Pemerintah', color: 'purple' },
        };
        const config = typeConfig[record.type];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      valueEnum: {
        internal: { text: 'Internal', status: 'Processing' },
        external: { text: 'Eksternal', status: 'Success' },
        certified: { text: 'Tersertifikasi', status: 'Warning' },
        government: { text: 'Pemerintah', status: 'Error' },
      },
    },
    {
      title: 'Kapasitas',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (_, record) => `${record.capacity} sampel/hari`,
    },
    {
      title: 'Estimasi Waktu',
      dataIndex: 'timeEstimate',
      key: 'timeEstimate',
      render: (_, record) => `${record.timeEstimate} jam`,
    },
    {
      title: 'Kontak',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.contactPerson}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'Sertifikasi',
      dataIndex: 'certification',
      key: 'certification',
      render: (_, record) => (
        <div>
          {record.certification.map((cert, index) => (
            <Tag key={`${record.id}-cert-${index}`} style={{ marginBottom: 2, fontSize: '11px' }}>
              {cert}
            </Tag>
          ))}
        </div>
      ),
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
            title="Hapus laboratorium"
            description="Yakin ingin menghapus data laboratorium ini?"
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
    setEditingLab(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (lab: Laboratory) => {
    setEditingLab(lab);
    form.setFieldsValue({
      ...lab,
      certification: lab.certification.join(', '),
    });
    setModalVisible(true);
  };

  const handleDelete = async (_id: string) => {
    try {
      message.success('Data laboratorium berhasil dihapus');
      actionRef.current?.reload();
    } catch {
      message.error('Gagal menghapus data laboratorium');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Process certification string to array
      const certificationArray = values.certification 
        ? values.certification.split(',').map((cert: string) => cert.trim()).filter((cert: string) => cert)
        : [];
      
      console.log('Processing form data with certifications:', certificationArray);
      
      if (editingLab) {
        message.success('Data laboratorium berhasil diperbarui');
      } else {
        message.success('Data laboratorium berhasil ditambahkan');
      }
      
      setModalVisible(false);
      setEditingLab(null);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingLab(null);
    form.resetFields();
  };

  // Mock data request
  const fetchLaboratories = async () => {
    const mockData: Laboratory[] = [
      {
        id: '1',
        name: 'Laboratorium Pertamina Upstream',
        code: 'LPUJ',
        location: 'Jakarta',
        type: 'internal',
        capacity: 50,
        timeEstimate: 24,
        contactPerson: 'Dr. Ahmad Susanto',
        phone: '+62-21-1234567',
        email: 'ahmad.susanto@pertamina.com',
        status: 'active',
        certification: ['ISO 17025', 'ASTM D4057'],
        createdAt: '2024-01-15T08:00:00Z',
      },
      {
        id: '2',
        name: 'Lemigas',
        code: 'LMG',
        location: 'Jakarta Selatan',
        type: 'government',
        capacity: 100,
        timeEstimate: 48,
        contactPerson: 'Prof. Budi Hartono',
        phone: '+62-21-7654321',
        email: 'budi.hartono@lemigas.esdm.go.id',
        status: 'active',
        certification: ['ISO 17025', 'SNI', 'ASTM D4057', 'IP 051'],
        createdAt: '2024-01-10T10:30:00Z',
      },
      {
        id: '3',
        name: 'Lab Kilang Balongan',
        code: 'BLG',
        location: 'Indramayu, Jawa Barat',
        type: 'internal',
        capacity: 75,
        timeEstimate: 36,
        contactPerson: 'Ir. Siti Nurhasanah',
        phone: '+62-234-567890',
        email: 'siti.nurhasanah@pertamina.com',
        status: 'maintenance',
        certification: ['ISO 17025', 'ASTM D4057'],
        createdAt: '2024-01-05T14:15:00Z',
      },
      {
        id: '4',
        name: 'PPPTMGB Lemigas',
        code: 'PPPTMGB',
        location: 'Bandung',
        type: 'certified',
        capacity: 80,
        timeEstimate: 72,
        contactPerson: 'Dr. Rini Setiawati',
        phone: '+62-22-2468013',
        email: 'rini.setiawati@ppptmgb.org',
        status: 'active',
        certification: ['ISO 17025', 'KAN', 'ASTM D4057', 'IP 051', 'EN 14214'],
        createdAt: '2023-12-20T09:45:00Z',
      },
      {
        id: '5',
        name: 'SGS Indonesia',
        code: 'SGS',
        location: 'Jakarta',
        type: 'external',
        capacity: 120,
        timeEstimate: 48,
        contactPerson: 'John Smith',
        phone: '+62-21-1357924',
        email: 'john.smith@sgs.com',
        status: 'active',
        certification: ['ISO 17025', 'ASTM D4057', 'IP 051', 'EN 14214', 'UKAS'],
        createdAt: '2023-11-30T16:20:00Z',
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
      title="Management Laboratorium"
      content="Kelola data laboratorium untuk sistem pengujian sample"
    >
      <ProTable<Laboratory>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={fetchLaboratories}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="Daftar Laboratorium"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Tambah Laboratorium
          </Button>,
        ]}
      />

      <Modal
        title={editingLab ? 'Edit Data Laboratorium' : 'Tambah Data Laboratorium'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="code"
              label="Kode Laboratorium"
              rules={[
                { required: true, message: 'Kode lab wajib diisi' },
                { pattern: /^[A-Z0-9]+$/, message: 'Kode harus huruf kapital dan angka' }
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Contoh: LPUJ" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Jenis"
              rules={[{ required: true, message: 'Jenis lab wajib dipilih' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Pilih jenis">
                <Select.Option value="internal">Internal</Select.Option>
                <Select.Option value="external">Eksternal</Select.Option>
                <Select.Option value="certified">Tersertifikasi</Select.Option>
                <Select.Option value="government">Pemerintah</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="name"
            label="Nama Laboratorium"
            rules={[{ required: true, message: 'Nama lab wajib diisi' }]}
          >
            <Input placeholder="Masukkan nama lengkap laboratorium" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Lokasi"
            rules={[{ required: true, message: 'Lokasi wajib diisi' }]}
          >
            <Input placeholder="Masukkan alamat lokasi laboratorium" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="capacity"
              label="Kapasitas (sampel/hari)"
              rules={[{ required: true, message: 'Kapasitas wajib diisi' }]}
              style={{ flex: 1 }}
            >
              <InputNumber 
                min={1}
                style={{ width: '100%' }}
                placeholder="Masukkan kapasitas"
              />
            </Form.Item>

            <Form.Item
              name="timeEstimate"
              label="Estimasi Waktu (jam)"
              rules={[{ required: true, message: 'Estimasi waktu wajib diisi' }]}
              style={{ flex: 1 }}
            >
              <InputNumber 
                min={1}
                style={{ width: '100%' }}
                placeholder="Estimasi waktu pengujian"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="contactPerson"
            label="Nama Kontak Person"
            rules={[{ required: true, message: 'Kontak person wajib diisi' }]}
          >
            <Input placeholder="Masukkan nama kontak person" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="phone"
              label="Nomor Telepon"
              rules={[{ required: true, message: 'Nomor telepon wajib diisi' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="+62-21-1234567" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Email wajib diisi' },
                { type: 'email', message: 'Format email tidak valid' }
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="email@example.com" />
            </Form.Item>
          </div>

          <Form.Item
            name="certification"
            label="Sertifikasi (pisahkan dengan koma)"
            rules={[{ required: true, message: 'Sertifikasi wajib diisi' }]}
          >
            <Input.TextArea 
              rows={2}
              placeholder="Contoh: ISO 17025, ASTM D4057, IP 051"
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
              <Select.Option value="maintenance">Maintenance</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Laboratories;
