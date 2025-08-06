import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Tag, Space, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const columns: ProColumns<UserItem>[] = [
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
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
      valueEnum: {
        'sample-officer': { text: 'Sample Officer', status: 'Processing' },
        'supervisor': { text: 'Supervisor', status: 'Success' },
        'head': { text: 'Head', status: 'Error' },
        'lab-staff': { text: 'Lab Staff', status: 'Warning' },
      },
    },
    {
      title: 'Departemen',
      dataIndex: 'department',
      key: 'department',
      valueEnum: {
        'pertamina': { text: 'Pertamina', status: 'Default' },
        'laboratory': { text: 'Laboratory', status: 'Default' },
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.status === 'active' ? 'green' : 'red'}>
          {record.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
        </Tag>
      ),
    },
    {
      title: 'Tanggal Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'date',
      sorter: true,
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
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (user: UserItem) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDelete = (user: UserItem) => {
    Modal.confirm({
      title: 'Hapus User',
      content: `Apakah Anda yakin ingin menghapus user ${user.name}?`,
      onOk: async () => {
        message.success('User berhasil dihapus');
        actionRef.current?.reload();
      },
    });
  };

  const handleModalOk = async () => {
    try {
      await form.validateFields();
      if (editingUser) {
        message.success('User berhasil diperbarui');
      } else {
        message.success('User berhasil ditambahkan');
      }
      setModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  // Mock data request
  const fetchUsers = async () => {
    const mockUsers: UserItem[] = [
      {
        id: '1',
        name: 'Moch. Aby Gazal',
        email: 'aby.gazal@pertamina.com',
        role: 'sample-officer',
        department: 'pertamina',
        status: 'active',
        createdAt: '2025-01-01',
      },
      {
        id: '2',
        name: 'Sedry Muhammad Iqbal',
        email: 'sedry.iqbal@pertamina.com',
        role: 'supervisor',
        department: 'pertamina',
        status: 'active',
        createdAt: '2025-01-02',
      },
      {
        id: '3',
        name: 'Dr. Ahmad Laboratorium',
        email: 'ahmad.lab@lpuj.co.id',
        role: 'lab-staff',
        department: 'laboratory',
        status: 'active',
        createdAt: '2025-01-03',
      },
    ];

    return {
      data: mockUsers,
      success: true,
      total: mockUsers.length,
    };
  };

  return (
    <PageContainer
      title="Manajemen User"
      content="Kelola pengguna dan hak akses dalam sistem Go Sample"
    >
      <ProTable<UserItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={fetchUsers}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="Daftar User"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            type="primary"
          >
            Tambah User
          </Button>,
        ]}
      />

      <Modal
        title={editingUser ? 'Edit User' : 'Tambah User'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            department: 'pertamina',
            role: 'sample-officer',
          }}
        >
          <Form.Item
            name="name"
            label="Nama"
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
            <Input placeholder="nama@email.com" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Role wajib dipilih' }]}
          >
            <Select placeholder="Pilih role">
              <Select.Option value="sample-officer">Sample Officer</Select.Option>
              <Select.Option value="supervisor">Supervisor</Select.Option>
              <Select.Option value="head">Head</Select.Option>
              <Select.Option value="lab-staff">Lab Staff</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="Departemen"
            rules={[{ required: true, message: 'Departemen wajib dipilih' }]}
          >
            <Select placeholder="Pilih departemen">
              <Select.Option value="pertamina">Pertamina</Select.Option>
              <Select.Option value="laboratory">Laboratory</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Status wajib dipilih' }]}
          >
            <Select placeholder="Pilih status">
              <Select.Option value="active">Aktif</Select.Option>
              <Select.Option value="inactive">Tidak Aktif</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default UserManagement;
