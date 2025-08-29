import {
  ExportOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Modal,
  message,
  Space,
  Tag,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';
import { createRole, deleteRole, updateRole } from '@/services/roles/api';
import type {
  CreateRoleRequest,
  Role,
  UpdateRoleRequest,
} from '@/services/roles/typings';
import { mockAvailableModules, mockRoles } from '../../../../mock/roles.mock';
import RoleForm from './components/RoleForm';
import RoleTable from './components/RoleTable';

const { Title, Text } = Typography;

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Role | undefined>();
  const [viewingRecord, setViewingRecord] = useState<Role | undefined>();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingRecord(undefined);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: Role) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      permissions: record.permissions,
    });
    setDrawerVisible(true);
  };

  const handleView = (record: Role) => {
    setViewingRecord(record);
    setDetailVisible(true);
  };

  const handleDelete = (record: Role) => {
    if (record.userCount > 0) {
      message.warning(
        `Role ${record.name} masih digunakan oleh ${record.userCount} pengguna dan tidak dapat dihapus`,
      );
      return;
    }

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
      onOk: async () => {
        try {
          setLoading(true);
          // In real app, call API
          // await deleteRole(record.id);

          // Update local state for demo
          setRoles((prevRoles) =>
            prevRoles.filter((role) => role.id !== record.id),
          );

          message.success(`Role ${record.name} berhasil dihapus`);
          actionRef.current?.reload();
        } catch (error) {
          message.error('Gagal menghapus role');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleSubmit = async (
    values: CreateRoleRequest | UpdateRoleRequest,
  ) => {
    try {
      setLoading(true);

      if (editingRecord) {
        // Update role
        // In real app: await updateRole(editingRecord.id, values);

        const updatedRole: Role = {
          ...editingRecord,
          ...values,
          updatedAt: new Date().toISOString(),
        };

        setRoles((prevRoles) =>
          prevRoles.map((role) =>
            role.id === editingRecord.id ? updatedRole : role,
          ),
        );

        message.success('Role berhasil diperbarui');
      } else {
        // Create new role
        // In real app: await createRole(values);

        const newRole: Role = {
          id: `role-${Date.now()}`,
          ...values,
          unitId: 'ce587291-31a8-488d-9fd0-140749d2137b',
          unitName: 'SHAFTI',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userCount: 0,
        };

        setRoles((prevRoles) => [newRole, ...prevRoles]);
        message.success('Role berhasil ditambahkan');
      }

      setDrawerVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      message.error(
        editingRecord ? 'Gagal memperbarui role' : 'Gagal menambahkan role',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    message.info('Fitur export sedang dalam pengembangan');
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRoles([...mockRoles]);
      setLoading(false);
      message.success('Data berhasil di-refresh');
      actionRef.current?.reload();
    }, 1000);
  };

  const getModuleInfo = (permissionKey: string) => {
    return mockAvailableModules.find((module) => module.key === permissionKey);
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
          loading={loading}
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
          dataSource={roles}
          loading={loading}
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
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
        }}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Batal</Button>
            <Button
              type="primary"
              loading={loading}
              onClick={() => form.submit()}
              style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
            >
              {editingRecord ? 'Perbarui' : 'Simpan'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <RoleForm form={form} initialData={editingRecord} />
        </Form>
      </Drawer>

      {/* Detail Modal */}
      <Modal
        title="Detail Role"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Tutup
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setDetailVisible(false);
              if (viewingRecord) {
                handleEdit(viewingRecord);
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
                    <Text type="secondary">{viewingRecord.unitName}</Text>
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

              <Descriptions.Item label="Jumlah Pengguna">
                <Tag color={viewingRecord.userCount > 0 ? 'blue' : 'default'}>
                  {viewingRecord.userCount} pengguna
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Unit/Organisasi">
                {viewingRecord.unitName}
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
                Permissions ({viewingRecord.permissions.length})
              </Title>
              {viewingRecord.permissions.length === 0 ? (
                <Text type="secondary">
                  Tidak ada permission yang diberikan
                </Text>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {viewingRecord.permissions.map((permission) => {
                    const moduleInfo = getModuleInfo(permission);
                    return (
                      <Card
                        key={permission}
                        size="small"
                        style={{
                          minWidth: '200px',
                          margin: '4px',
                          border: '1px solid #fd0017',
                          backgroundColor: '#fff2f0',
                        }}
                      >
                        <Space>
                          <span style={{ fontSize: '16px' }}>
                            {moduleInfo?.icon || '📁'}
                          </span>
                          <div>
                            <Text strong style={{ fontSize: '14px' }}>
                              {moduleInfo?.name || permission}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {moduleInfo?.description ||
                                'Modul tidak ditemukan'}
                            </Text>
                          </div>
                        </Space>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default RoleManagement;
