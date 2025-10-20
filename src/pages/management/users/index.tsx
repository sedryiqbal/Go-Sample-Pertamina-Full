import { DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Form,
  Input,
  Modal,
  message,
  Select,
  Space,
  Switch,
  Tag,
} from 'antd';
import { createStyles } from 'antd-style';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  createUser,
  deleteUser,
  fetchRoles,
  searchUsers,
  updateUser,
} from '@/services/users/api';
import type { RoleListItem, UserListItem } from '@/services/users/typings';

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const source = error as Record<string, any>;
  const messageCandidate =
    source?.data?.message ||
    source?.data?.data?.message ||
    source?.response?.data?.message ||
    source?.response?.data?.data?.message ||
    source?.message;

  if (typeof messageCandidate === 'string' && messageCandidate.trim()) {
    return messageCandidate;
  }

  return fallback;
};

const useStyles = createStyles(({ token }) => ({
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: token.marginLG,
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
  },
  tableCard: {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    overflow: 'hidden',
    padding: token.paddingLG,
    width: '100%',
    [`@media (max-width: ${token.screenLG}px)`]: {
      padding: token.paddingMD,
    },
    [`@media (max-width: ${token.screenSM}px)`]: {
      padding: token.paddingSM,
    },
  },
}));

const Users: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { styles } = useStyles();
  const [form] = Form.useForm<CreateUserFormValues>();
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRoleList = async () => {
      setLoadingRoles(true);
      try {
        const list = await fetchRoles();
        if (isMounted) {
          setRoles(list);
        }
      } catch (_error) {
        message.error('Gagal memuat daftar role');
      } finally {
        if (isMounted) {
          setLoadingRoles(false);
        }
      }
    };

    fetchRoleList();

    return () => {
      isMounted = false;
    };
  }, [fetchRoles]);

  const handleOpenCreate = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({ superAdmin: false });
    setEditingUser(null);
    setFormModalVisible(true);
  }, [form]);

  const handleOpenEdit = useCallback(
    (record: UserListItem) => {
      setEditingUser(record);
      form.setFieldsValue({
        name: record.name,
        username: record.username,
        email: record.email,
        password: '',
        roleId: record.roleId,
        superAdmin: record.superAdmin,
      });
      setFormModalVisible(true);
    },
    [form],
  );

  const handleCloseForm = useCallback(() => {
    setFormModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  }, [form]);

  const handleSubmitForm = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSavingUser(true);

      const payload = {
        username: values.username.trim(),
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        roleId: values.roleId,
        superAdmin: values.superAdmin ?? false,
      };

      if (editingUser) {
        const response = await updateUser(editingUser.id, payload);
        if (response?.status === false) {
          throw new Error(
            response?.data?.message ||
              response?.message ||
              'Gagal memperbarui user',
          );
        }
        message.success('User berhasil diperbarui');
      } else {
        const response = await createUser(payload);
        if (response?.status === false) {
          throw new Error(
            response?.data?.message ||
              response?.message ||
              'Gagal membuat user',
          );
        }
        message.success('User berhasil dibuat');
      }

      setFormModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }

      const fallback = editingUser
        ? 'Gagal memperbarui user'
        : 'Gagal membuat user';
      const description = resolveErrorMessage(error, fallback);
      message.error(description);
    } finally {
      setSavingUser(false);
    }
  }, [createUser, editingUser, form, resolveErrorMessage, updateUser]);

  const handleDeleteUser = useCallback(
    (record: UserListItem) => {
      setDeletingUserId(record.id);
      Modal.confirm({
        title: 'Konfirmasi Hapus',
        content: `Hapus user ${record.name}? Tindakan ini tidak dapat dibatalkan.`,
        okText: 'Hapus',
        okType: 'danger',
        cancelText: 'Batal',
        async onOk() {
          try {
            await deleteUser(record.id);
            message.success('User berhasil dihapus');
            actionRef.current?.reload();
          } catch (error) {
            const description = resolveErrorMessage(
              error,
              'Gagal menghapus user',
            );
            message.error(description);
            throw error;
          } finally {
            setDeletingUserId(null);
          }
        },
        onCancel() {
          setDeletingUserId(null);
        },
      });
    },
    [deleteUser, resolveErrorMessage],
  );

  const columns: ProColumns<UserListItem>[] = [
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ color: '#fd0017' }} />
          <span style={{ fontWeight: 500 }}>{record.name}</span>
        </Space>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 160,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      copyable: true,
      width: 220,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'Role',
      dataIndex: 'roleId',
      key: 'roleId',
      valueType: 'select',
      fieldProps: {
        allowClear: true,
        showSearch: true,
        optionFilterProp: 'label',
      },
      request: async () => {
        try {
          const roles = await fetchRoles();
          return roles.map((role) => ({
            label: role.name,
            value: role.id,
          }));
        } catch (_error) {
          message.error('Gagal memuat daftar role');
          return [];
        }
      },
      render: (_, record) => (
        <Tag color="blue" style={{ marginRight: 0 }}>
          {record.roleName || 'Tanpa Role'}
        </Tag>
      ),
    },
    {
      title: 'Unit',
      dataIndex: 'unitName',
      key: 'unitName',
      hideInSearch: true,
      width: 200,
    },
    {
      title: 'Super Admin',
      dataIndex: 'superAdmin',
      key: 'superAdmin',
      hideInSearch: true,
      render: (_, record) => (
        <Tag color={record.superAdmin ? 'red' : 'default'}>
          {record.superAdmin ? 'Ya' : 'Tidak'}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Dibuat Pada',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 200,
    },
    {
      title: 'Aksi',
      key: 'actions',
      valueType: 'option',
      width: 180,
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleOpenEdit(record)}
        >
          Edit
        </Button>,
        <Button
          key="delete"
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteUser(record)}
          disabled={deletingUserId === record.id}
          loading={deletingUserId === record.id}
        >
          Hapus
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer
      title="Manajemen User"
      content="Kelola pengguna sistem Go Sample dengan pencarian spesifik."
      className={styles.pageWrapper}
    >
      <div className={styles.tableCard}>
        <ProTable<UserListItem>
          actionRef={actionRef}
          rowKey="id"
          columns={columns}
          pagination={{
            pageSize: 10,
            showQuickJumper: true,
          }}
          search={{
            labelWidth: 'auto',
            defaultCollapsed: false,
          }}
          form={{
            layout: 'vertical',
          }}
          scroll={{ x: 'max-content' }}
          request={async (params) => {
            const {
              current = 1,
              pageSize = 10,
              name,
              username,
              roleId,
            } = params;
            try {
              const response = await searchUsers({
                page: current,
                pageSize,
                name,
                username,
                roleId,
              });

              const success = Boolean(response?.status);
              const items = response?.data?.items;
              if (!success) {
                message.error(
                  response?.data?.message || 'Gagal memuat data user',
                );
              }

              return {
                data: items?.data ?? [],
                total: items?.totalCount ?? 0,
                success,
              };
            } catch (error) {
              message.error('Terjadi kesalahan saat mengambil data user');
              throw error;
            }
          }}
          toolBarRender={() => [
            <Button
              key="create"
              type="primary"
              onClick={handleOpenCreate}
              style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
            >
              Tambah User
            </Button>,
            <Button key="refresh" onClick={() => actionRef.current?.reload()}>
              Muat Ulang
            </Button>,
          ]}
          dateFormatter="string"
          headerTitle="Daftar User"
          cardProps={{
            bordered: false,
          }}
        />
      </div>
      <Modal
        title={editingUser ? 'Edit User' : 'Tambah User'}
        open={formModalVisible}
        onCancel={handleCloseForm}
        onOk={handleSubmitForm}
        confirmLoading={savingUser}
        okText="Simpan"
        cancelText="Batal"
        destroyOnClose
      >
        <Form<CreateUserFormValues>
          layout="vertical"
          form={form}
          initialValues={{ superAdmin: false }}
        >
          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: 'Nama wajib diisi' }]}
          >
            <Input placeholder="New User" />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Username wajib diisi' },
              { min: 4, message: 'Username minimal 4 karakter' },
            ]}
          >
            <Input placeholder="newuser234" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email wajib diisi' },
              { type: 'email', message: 'Format email tidak valid' },
            ]}
          >
            <Input placeholder="newuser@example.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Password wajib diisi' },
              { min: 6, message: 'Password minimal 6 karakter' },
            ]}
          >
            <Input.Password placeholder="SecurePass123!" />
          </Form.Item>
          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: 'Role wajib dipilih' }]}
          >
            <Select
              placeholder="Pilih role"
              options={roles.map((role) => ({
                label: role.name,
                value: role.id,
              }))}
              loading={loadingRoles}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            name="superAdmin"
            label="Super Admin"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Users;

interface CreateUserFormValues {
  name: string;
  username: string;
  email: string;
  password: string;
  roleId: string;
  superAdmin?: boolean;
}
