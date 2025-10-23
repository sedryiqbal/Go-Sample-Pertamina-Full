import {
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Modal,
  message,
  Space,
  Spin,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';
import {
  assignRoleMenus,
  createRole,
  deleteRole,
  getMenus,
  getRoleAvailableMenus,
  getRolePermissions,
  updateRole,
} from '@/services/roles/api';
import type {
  Role,
  RoleMenuOption,
  RoleMenuPermission,
} from '@/services/roles/typings';
import RoleForm from './components/RoleForm';
import RoleTable from './components/RoleTable';

const { Title, Text } = Typography;
type RoleFormValues = {
  name: string;
  description?: string;
  menuIds?: number[];
};

const RoleManagement: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Role | undefined>();
  const [viewingRecord, setViewingRecord] = useState<Role | undefined>();
  const [availableMenus, setAvailableMenus] = useState<RoleMenuOption[]>([]);
  const [availableMenusLoading, setAvailableMenusLoading] = useState(false);
  const [availableMenuTotal, setAvailableMenuTotal] = useState<number>(0);
  const [availableMenuSelectedCount, setAvailableMenuSelectedCount] =
    useState<number>(0);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [permissionError, setPermissionError] = useState<string>();
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<RoleFormValues>();
  const permissionRequestIdRef = useRef<symbol | null>(null);
  const editRequestIdRef = useRef<symbol | null>(null);

  const handleAdd = async () => {
    const requestId = Symbol('create-role');
    editRequestIdRef.current = requestId;
    setEditingRecord(undefined);
    setAvailableMenus([]);
    setAvailableMenusLoading(true);
    setAvailableMenuTotal(0);
    setAvailableMenuSelectedCount(0);
    form.resetFields();
    setDrawerVisible(true);

    try {
      const menuData = await getMenus();
      if (editRequestIdRef.current !== requestId) {
        return;
      }

      setAvailableMenus(menuData.menus);
      setAvailableMenuTotal(menuData.totalMenus);
      const selectedFromMenus = menuData.menus
        .filter((menu) => menu.isSelected)
        .map((menu) => menu.menuId);
      form.setFieldsValue({
        menuIds: selectedFromMenus,
      });
      setAvailableMenuSelectedCount(
        menuData.selectedCount ?? selectedFromMenus.length ?? 0,
      );
    } catch (error: any) {
      if (editRequestIdRef.current === requestId) {
        message.error(
          error?.message || 'Gagal memuat daftar menu yang tersedia',
        );
      }
    } finally {
      if (editRequestIdRef.current === requestId) {
        setAvailableMenusLoading(false);
      }
    }
  };

  const handleEdit = async (record: Role) => {
    const requestId = Symbol('edit-role');
    editRequestIdRef.current = requestId;

    setEditingRecord(record);
    setDrawerVisible(true);
    setAvailableMenus([]);
    setAvailableMenusLoading(true);
    setAvailableMenuTotal(0);
    form.resetFields();
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      menuIds: record.menuPermissions?.map((menu) => menu.menuId) ?? [],
    });
    setAvailableMenuSelectedCount(
      record.menuPermissions?.length ?? record.totalPermissions ?? 0,
    );

    try {
      const menuData = await getRoleAvailableMenus(record.id);
      if (editRequestIdRef.current === requestId) {
        setAvailableMenus(menuData.menus);
        setAvailableMenuTotal(menuData.totalMenus);
        const selectedFromMenus = menuData.menus
          .filter((menu) => menu.isSelected)
          .map((menu) => menu.menuId);
        form.setFieldsValue({
          menuIds: selectedFromMenus,
        });
        setAvailableMenuSelectedCount(
          menuData.selectedCount ?? selectedFromMenus.length ?? 0,
        );
      }
    } catch (error: any) {
      if (editRequestIdRef.current === requestId) {
        setAvailableMenus([]);
        message.error(
          error?.message || 'Gagal memuat daftar menu yang tersedia',
        );
      }
    }

    try {
      const permissions = await getRolePermissions(record.id);
      if (editRequestIdRef.current !== requestId) {
        return;
      }

      form.setFieldsValue({
        name: permissions.name || record.name,
        description: permissions.description ?? record.description,
        menuIds: permissions.permissions.map((permission) => permission.menuId),
      });
      setAvailableMenuSelectedCount(
        permissions.totalPermissions ?? permissions.permissions.length,
      );
      setEditingRecord((prev) =>
        prev
          ? {
              ...prev,
              name: permissions.name || record.name,
              description: permissions.description ?? record.description,
              menuPermissions: permissions.permissions,
              totalPermissions: permissions.totalPermissions,
            }
          : prev,
      );
    } catch (error: any) {
      if (editRequestIdRef.current === requestId) {
        message.error(error?.message || 'Gagal memuat permissions role');
      }
    } finally {
      if (editRequestIdRef.current === requestId) {
        setAvailableMenusLoading(false);
      }
    }
  };

  const handleView = async (record: Role) => {
    setViewingRecord({
      ...record,
      menuPermissions: [],
      totalPermissions:
        record.totalPermissions ?? record.menuPermissions?.length,
    });
    const requestId = Symbol('role-permissions');
    permissionRequestIdRef.current = requestId;
    setPermissionError(undefined);
    setPermissionLoading(true);
    setDetailVisible(true);

    try {
      const result = await getRolePermissions(record.id);
      if (permissionRequestIdRef.current !== requestId) {
        return;
      }
      setViewingRecord((prev) => ({
        ...(prev ?? record),
        id: result.id,
        name: result.name,
        description: result.description,
        menuPermissions: result.permissions,
        totalPermissions: result.totalPermissions,
        createdAt: result.createdAt ?? prev?.createdAt ?? record.createdAt,
        updatedAt: prev?.updatedAt ?? record.updatedAt,
      }));
    } catch (error: any) {
      const errorMessage =
        error?.message || 'Terjadi kesalahan saat memuat permissions role';
      setPermissionError(errorMessage);
      message.error(errorMessage);
    } finally {
      if (permissionRequestIdRef.current === requestId) {
        setPermissionLoading(false);
      }
    }
  };

  const handleDelete = (record: Role) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus Role',
      content: (
        <div>
          <p>
            Apakah Anda yakin ingin menghapus role{' '}
            <strong>{record.name}</strong>?
          </p>
          <p style={{ color: '#ff4d4f', fontSize: '12px' }}>
            ⚠️ Tindakan ini tidak dapat dibatalkan
          </p>
        </div>
      ),
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      async onOk() {
        const hide = message.loading('Menghapus role...', 0);
        try {
          await deleteRole(record.id);
          hide();
          message.success(`Role ${record.name} berhasil dihapus`);
          if (viewingRecord?.id === record.id) {
            closeDetailModal();
          }
          actionRef.current?.reload();
        } catch (error: any) {
          hide();
          message.error(error?.message || 'Gagal menghapus role');
          throw error;
        }
      },
    });
  };

  const closeRoleDrawer = () => {
    editRequestIdRef.current = null;
    setDrawerVisible(false);
    setEditingRecord(undefined);
    setAvailableMenus([]);
    setAvailableMenusLoading(false);
    setAvailableMenuTotal(0);
    setAvailableMenuSelectedCount(0);
    setFormSubmitting(false);
    form.resetFields();
  };

  const handleSubmit = async (values: RoleFormValues) => {
    try {
      setFormSubmitting(true);
      const normalizedMenuIds = Array.isArray(values.menuIds)
        ? values.menuIds.map((id) => Number(id))
        : [];

      if (!editingRecord) {
        const newRole = await createRole({
          name: values.name,
          description: values.description,
        });

        await assignRoleMenus(newRole.id, normalizedMenuIds);
        message.success('Role berhasil ditambahkan');
        closeRoleDrawer();
        actionRef.current?.reload();
        return;
      }

      const updatedRole = await updateRole(editingRecord.id, {
        name: values.name,
        description: values.description,
      });

      await assignRoleMenus(editingRecord.id, normalizedMenuIds);
      setAvailableMenuSelectedCount(normalizedMenuIds.length);

      const shouldRefreshDetail =
        detailVisible && viewingRecord?.id === editingRecord.id;

      if (shouldRefreshDetail) {
        const detailRequestId = Symbol('role-permissions-refresh');
        permissionRequestIdRef.current = detailRequestId;
        setPermissionError(undefined);
        setPermissionLoading(true);
        try {
          const refreshedPermissions = await getRolePermissions(
            editingRecord.id,
          );
          if (permissionRequestIdRef.current === detailRequestId) {
            setViewingRecord((prev) =>
              prev && prev.id === editingRecord.id
                ? {
                    ...prev,
                    name: updatedRole.name,
                    description: updatedRole.description,
                    menuPermissions: refreshedPermissions.permissions,
                    totalPermissions: refreshedPermissions.totalPermissions,
                    createdAt: refreshedPermissions.createdAt ?? prev.createdAt,
                    updatedAt: updatedRole.updatedAt ?? prev.updatedAt,
                  }
                : prev,
            );
          }
        } catch (error: any) {
          if (permissionRequestIdRef.current === detailRequestId) {
            const errMessage =
              error?.message ||
              'Role diperbarui, tetapi gagal memuat ulang permissions.';
            setPermissionError(errMessage);
            message.error(errMessage);
          }
        } finally {
          if (permissionRequestIdRef.current === detailRequestId) {
            setPermissionLoading(false);
          }
        }
      }

      message.success('Role berhasil diperbarui');
      closeRoleDrawer();
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error?.message || 'Terjadi kesalahan saat memproses role');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleExport = () => {
    message.info('Fitur export sedang dalam pengembangan');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    actionRef.current?.reload?.();
    setTimeout(() => setRefreshing(false), 600);
    message.success('Data role berhasil diperbarui');
  };

  const closeDetailModal = () => {
    permissionRequestIdRef.current = null;
    setDetailVisible(false);
    setViewingRecord(undefined);
    setPermissionError(undefined);
    setPermissionLoading(false);
  };

  return (
    <PageContainer
      title="Manajemen Role"
      content="Kelola role dan permissions pengguna sistem Go Sample"
      extra={[
        <Button key="export" icon={<ExportOutlined />} onClick={handleExport}>
          Export
        </Button>,
        <Button
          key="refresh"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={refreshing}
        >
          Refresh
        </Button>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          Tambah Role
        </Button>,
      ]}
    >
      <Card>
        <RoleTable
          actionRef={actionRef}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </Card>

      {/* Create/Edit Drawer */}
      <Drawer
        title={editingRecord ? 'Edit Role' : 'Tambah Role Baru'}
        width={720}
        open={drawerVisible}
        onClose={closeRoleDrawer}
        extra={
          <Space>
            <Button onClick={closeRoleDrawer}>Batal</Button>
            <Button
              type="primary"
              loading={formSubmitting}
              disabled={availableMenusLoading}
              onClick={() => form.submit()}
              style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
            >
              {editingRecord ? 'Perbarui' : 'Simpan'}
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={(_, allValues) => {
            if (Object.hasOwn(allValues, 'menuIds')) {
              const nextCount = Array.isArray(allValues.menuIds)
                ? allValues.menuIds.length
                : 0;
              setAvailableMenuSelectedCount(nextCount);
            }
          }}
        >
          <RoleForm
            form={form}
            menuOptions={availableMenus}
            menuOptionsLoading={availableMenusLoading}
            showMenuSelector={
              Boolean(editingRecord) || availableMenus.length > 0
            }
            totalMenus={availableMenuTotal}
            selectedCount={availableMenuSelectedCount}
          />
        </Form>
      </Drawer>

      {/* Detail Modal */}
      <Modal
        title="Detail Role"
        open={detailVisible}
        onCancel={closeDetailModal}
        footer={[
          <Button key="close" onClick={closeDetailModal}>
            Tutup
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              const recordToEdit = viewingRecord;
              closeDetailModal();
              if (recordToEdit) {
                handleEdit(recordToEdit);
              }
            }}
            style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
          >
            Edit Role
          </Button>,
        ]}
        width={800}
      >
        {viewingRecord && (
          <div>
            <Descriptions
              title={
                <Space>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: '#fd0017',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }}
                  >
                    {viewingRecord.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      {viewingRecord.name}
                    </Title>
                    {viewingRecord.description && (
                      <Text type="secondary">{viewingRecord.description}</Text>
                    )}
                  </div>
                </Space>
              }
              bordered
              column={2}
              size="small"
            >
              <Descriptions.Item label="ID Role" span={2}>
                <Text code>{viewingRecord.id}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Deskripsi" span={2}>
                {viewingRecord.description ? (
                  viewingRecord.description
                ) : (
                  <Text type="secondary">Belum ada deskripsi</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Dibuat">
                {new Date(viewingRecord.createdAt).toLocaleString('id-ID')}
              </Descriptions.Item>

              <Descriptions.Item label="Terakhir Diperbarui">
                {new Date(viewingRecord.updatedAt).toLocaleString('id-ID')}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Title level={5}>
                Permissions (
                {viewingRecord.totalPermissions ??
                  viewingRecord.menuPermissions?.length ??
                  0}
                )
              </Title>
              {permissionLoading ? (
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <Spin tip="Memuat permissions..." />
                </div>
              ) : permissionError ? (
                <Alert
                  type="error"
                  showIcon
                  message="Gagal memuat permissions role"
                  description={permissionError}
                />
              ) : viewingRecord.menuPermissions &&
                viewingRecord.menuPermissions.length > 0 ? (
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: '100%' }}
                >
                  {viewingRecord.menuPermissions.map(
                    (permission: RoleMenuPermission) => (
                      <Card key={permission.menuId} size="small">
                        <Space align="start" size="large">
                          <span style={{ fontSize: '24px' }}>
                            {permission.menuIcon || '📁'}
                          </span>
                          <div>
                            <Text strong style={{ fontSize: '14px' }}>
                              {permission.menuNama}
                            </Text>
                            <div style={{ fontSize: '12px', marginTop: 4 }}>
                              {permission.menuDeskripsi}
                            </div>
                            <Space
                              size="middle"
                              style={{ marginTop: 12, display: 'flex' }}
                              wrap
                            >
                              <Text type="secondary">
                                URL: {permission.menuUrl || '-'}
                              </Text>
                              <Text type="secondary">
                                Urutan: #
                                {typeof permission.menuOrder === 'number'
                                  ? permission.menuOrder
                                  : '-'}
                              </Text>
                            </Space>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Ditugaskan oleh {permission.assignedBy} pada{' '}
                              {new Date(permission.assignedAt).toLocaleString(
                                'id-ID',
                              )}
                            </Text>
                          </div>
                        </Space>
                      </Card>
                    ),
                  )}
                </Space>
              ) : (
                <Text type="secondary">Belum ada permission</Text>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default RoleManagement;
