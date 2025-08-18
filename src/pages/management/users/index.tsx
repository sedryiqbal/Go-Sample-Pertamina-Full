import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  message,
  Select,
  Space,
  Switch,
  Tag,
} from 'antd';
import React, { useRef, useState } from 'react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'sample_officer' | 'supervisor' | 'head' | 'lab_employee';
  department: 'pertamina' | 'laboratory';
  phone: string;
  status: 'active' | 'inactive';
  created_at: string;
  last_login: string;
}

const Users: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<UserRecord | undefined>();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();

  const roleOptions = [
    { label: 'Sample Officer', value: 'sample_officer' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'Head', value: 'head' },
    { label: 'Lab Employee', value: 'lab_employee' },
  ];

  const departmentOptions = [
    { label: 'Pertamina', value: 'pertamina' },
    { label: 'Laboratory', value: 'laboratory' },
  ];

  const handleAdd = () => {
    setEditingRecord(undefined);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: UserRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setDrawerVisible(true);
  };

  const handleDelete = (record: UserRecord) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus',
      content: `Apakah Anda yakin ingin menghapus user ${record.name}?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk() {
        message.success(`User ${record.name} berhasil dihapus`);
        actionRef.current?.reload();
      },
    });
  };

  const handleSubmit = async (_values: any) => {
    try {
      if (editingRecord) {
        message.success('User berhasil diperbarui');
      } else {
        message.success('User berhasil ditambahkan');
      }
      setDrawerVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan data user');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'sample_officer':
        return 'blue';
      case 'supervisor':
        return 'green';
      case 'head':
        return 'purple';
      case 'lab_employee':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'sample_officer':
        return 'Sample Officer';
      case 'supervisor':
        return 'Supervisor';
      case 'head':
        return 'Head';
      case 'lab_employee':
        return 'Lab Employee';
      default:
        return role;
    }
  };

  const columns: ProColumns<UserRecord>[] = [
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ color: '#fd0017' }} />
          <span style={{ fontWeight: 500 }}>{record.name}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      copyable: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (_, record) => (
        <Tag color={getRoleColor(record.role)}>{getRoleLabel(record.role)}</Tag>
      ),
      filters: roleOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Departemen',
      dataIndex: 'department',
      key: 'department',
      render: (_, record) => (
        <Tag color={record.department === 'pertamina' ? 'red' : 'cyan'}>
          {record.department === 'pertamina' ? 'Pertamina' : 'Laboratory'}
        </Tag>
      ),
      filters: departmentOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Telepon',
      dataIndex: 'phone',
      key: 'phone',
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
      title: 'Last Login',
      dataIndex: 'last_login',
      key: 'last_login',
      valueType: 'dateTime',
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

  const mockData: UserRecord[] = [
    {
      id: '1',
      name: 'Moch. Aby Gazal',
      email: 'aby.gazal@pertamina.com',
      role: 'sample_officer',
      department: 'pertamina',
      phone: '08123456789',
      status: 'active',
      created_at: '2025-07-01',
      last_login: '2025-08-06 10:30:00',
    },
    {
      id: '2',
      name: 'Dr. Ahmad Lab',
      email: 'ahmad@lpuj.lab.id',
      role: 'lab_employee',
      department: 'laboratory',
      phone: '08987654321',
      status: 'active',
      created_at: '2025-07-01',
      last_login: '2025-08-06 09:45:00',
    },
    {
      id: '3',
      name: 'Supervisor Pertamina',
      email: 'supervisor@pertamina.com',
      role: 'supervisor',
      department: 'pertamina',
      phone: '08111222333',
      status: 'active',
      created_at: '2025-07-01',
      last_login: '2025-08-06 08:15:00',
    },
  ];

  return (
    <PageContainer
      title="Manajemen User"
      content="Kelola pengguna sistem Go Sample dengan role dan departemen yang sesuai"
      extra={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          Tambah User
        </Button>,
      ]}
    >
      <ProTable<UserRecord>
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
        headerTitle="Daftar User"
        toolBarRender={() => [
          <Button key="export" type="default">
            Export Excel
          </Button>,
        ]}
      />

      <Drawer
        title={editingRecord ? 'Edit User' : 'Tambah User Baru'}
        width={500}
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
            name="name"
            label="Nama Lengkap"
            rules={[{ required: true, message: 'Nama wajib diisi' }]}
          >
            <Input placeholder="Masukkan nama lengkap" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email wajib diisi' },
              { type: 'email', message: 'Format email tidak valid' },
            ]}
          >
            <Input placeholder="user@company.com" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Role wajib dipilih' }]}
          >
            <Select placeholder="Pilih role" options={roleOptions} />
          </Form.Item>

          <Form.Item
            name="department"
            label="Departemen"
            rules={[{ required: true, message: 'Departemen wajib dipilih' }]}
          >
            <Select
              placeholder="Pilih departemen"
              options={departmentOptions}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Nomor Telepon"
            rules={[{ required: true, message: 'Nomor telepon wajib diisi' }]}
          >
            <Input placeholder="08123456789" />
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

export default Users;
