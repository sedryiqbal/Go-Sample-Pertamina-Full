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
import { fetchLabs } from '@/services/labs/api';
import type { LabReference } from '@/services/labs/typings';
import {
  createUser,
  deleteUser,
  fetchRoles,
  searchUsers,
  updateUser,
} from '@/services/users/api';
import type {
  CreateUserPayload,
  RoleListItem,
  UserListItem,
} from '@/services/users/typings';
import { fetchUnits } from '@/services/units/api';
import type { UnitReference } from '@/services/units/typings';

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

const USER_STATUS_OPTIONS = [
  { label: 'Aktif', value: 'active' },
  { label: 'Nonaktif', value: 'inactive' },
];

const Users: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { styles } = useStyles();
  const [form] = Form.useForm<CreateUserFormValues>();
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [labs, setLabs] = useState<LabReference[]>([]);
  const [loadingLabs, setLoadingLabs] = useState(false);
  const [units, setUnits] = useState<UnitReference[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRoleList = async () => {
      setLoadingRoles(true);
      setLoadingLabs(true);
      setLoadingUnits(true);
      try {
        const [roleList, labList, unitList] = await Promise.all([
          fetchRoles().catch(() => {
            if (isMounted) {
              message.error('Gagal memuat daftar role');
            }
            return [];
          }),
          fetchLabs().catch(() => {
            if (isMounted) {
              message.error('Gagal memuat daftar laboratorium');
            }
            return [];
          }),
          fetchUnits().catch(() => {
            if (isMounted) {
              message.error('Gagal memuat daftar unit');
            }
            return [];
          }),
        ]);

        if (isMounted) {
          setRoles(roleList);
          setLabs(labList);
          setUnits(unitList);
        }
      } finally {
        if (isMounted) {
          setLoadingRoles(false);
          setLoadingLabs(false);
          setLoadingUnits(false);
        }
      }
    };

    fetchRoleList();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCreate = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({
      isSuperadmin: false,
      status: 'active',
      labId: undefined,
      unitId: undefined,
    });
    setEditingUser(null);
    setFormModalVisible(true);
  }, [form]);

  const handleOpenEdit = useCallback(
    (record: UserListItem) => {
      setEditingUser(record);
      form.setFieldsValue({
        name: record.name ?? '',
        email: record.email ?? '',
        password: '',
        roleId: record.roleId ?? undefined,
        labId: record.labId ?? undefined,
        unitId: record.unitId ?? undefined,
        isSuperadmin: record.isSuperadmin ?? false,
        phone: record.phone ?? '',
        status: record.status ?? 'active',
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

  const buildUserPayload = useCallback(
    (
      values: CreateUserFormValues,
      includePassword: boolean,
    ): CreateUserPayload => {
      if (values.roleId === undefined || values.roleId === null) {
        throw new Error('Role wajib dipilih');
      }

      const payload: CreateUserPayload = {
        email: values.email.trim(),
        nama: values.name.trim(),
        roleId: Number(values.roleId),
        isSuperadmin: Boolean(values.isSuperadmin),
        phone: values.phone.trim(),
        status: values.status || 'active',
      };

      if (values.labId !== undefined && values.labId !== null) {
        payload.labId = Number(values.labId);
      }
      if (values.unitId !== undefined && values.unitId !== null) {
        payload.unitId = Number(values.unitId);
      }

      if (includePassword && values.password) {
        payload.password = values.password;
      }

      return payload;
    },
    [],
  );

  const handleSubmitForm = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSavingUser(true);

      const includePassword = !editingUser || Boolean(values.password);
      const payload = buildUserPayload(values, includePassword);

      if (editingUser) {
        await updateUser(editingUser.id, payload);
        message.success('User berhasil diperbarui');
      } else {
        await createUser(payload);
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
  }, [
    buildUserPayload,
    createUser,
    editingUser,
    form,
    resolveErrorMessage,
    updateUser,
  ]);

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
      width: 220,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ color: '#fd0017' }} />
          <span style={{ fontWeight: 500 }}>{record.name}</span>
        </Space>
      ),
    },
    {
      title: 'Pencarian',
      dataIndex: 'search',
      key: 'search',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      copyable: true,
      width: 240,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'Role',
      dataIndex: 'roleName',
      key: 'roleName',
      hideInSearch: true,
      width: 180,
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
      title: 'Laboratorium',
      dataIndex: 'labName',
      key: 'labName',
      hideInSearch: true,
      width: 200,
    },
    {
      title: 'Telepon',
      dataIndex: 'phone',
      key: 'phone',
      hideInSearch: true,
      width: 160,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      hideInSearch: true,
      width: 140,
      render: (_, record) => {
        const status = record.status ?? 'unknown';
        const color =
          status === 'active'
            ? 'green'
            : status === 'inactive'
              ? 'default'
              : 'gold';
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Super Admin',
      dataIndex: 'isSuperadmin',
      key: 'isSuperadmin',
      hideInSearch: true,
      width: 140,
      render: (_, record) => (
        <Tag color={record.isSuperadmin ? 'red' : 'default'}>
          {record.isSuperadmin ? 'Ya' : 'Tidak'}
        </Tag>
      ),
    },
    {
      title: 'Terakhir Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 200,
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
            const { current = 1, pageSize = 10, search } = params;
            try {
              const response = await searchUsers({
                page: current,
                pageSize,
                search,
              });

              return {
                data: response.data,
                total: response.pagination.totalData,
                success: true,
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
        <Form<CreateUserFormValues> layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: 'Nama wajib diisi' }]}
          >
            <Input placeholder="New User" />
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
              {
                validator: (_, value) => {
                  if (!value) {
                    if (editingUser) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('Password wajib diisi saat membuat user'),
                    );
                  }
                  if (value.length < 6) {
                    return Promise.reject(
                      new Error('Password minimal 6 karakter'),
                    );
                  }
                  return Promise.resolve();
                },
              },
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
            name="phone"
            label="Nomor Telepon"
            rules={[{ required: true, message: 'Nomor telepon wajib diisi' }]}
          >
            <Input placeholder="+6281234567890" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Status wajib dipilih' }]}
          >
            <Select
              placeholder="Pilih status"
              options={USER_STATUS_OPTIONS}
              allowClear={false}
            />
          </Form.Item>
          <Form.Item name="unitId" label="Unit">
            <Select
              placeholder="Pilih unit"
              options={units.map((unit) => ({
                label: unit.name,
                value: unit.id,
              }))}
              loading={loadingUnits}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="labId" label="Laboratorium">
            <Select
              placeholder="Pilih laboratorium"
              options={labs.map((lab) => ({
                label: lab.name,
                value: lab.id,
              }))}
              loading={loadingLabs}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            name="isSuperadmin"
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
  email: string;
  password?: string;
  roleId: number;
  unitId?: number | null;
  labId?: number | null;
  isSuperadmin?: boolean;
  phone: string;
  status: string;
}
