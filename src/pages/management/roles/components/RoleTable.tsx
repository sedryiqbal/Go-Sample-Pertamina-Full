import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Badge, Button, Space, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import type { Role } from '@/services/roles/typings';
import { mockAvailableModules } from '../../../../../mock/roles.mock';

const { Text } = Typography;

interface RoleTableProps {
  dataSource: Role[];
  loading?: boolean;
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  onEdit?: (record: Role) => void;
  onDelete?: (record: Role) => void;
  onView?: (record: Role) => void;
}

const RoleTable: React.FC<RoleTableProps> = ({
  dataSource,
  loading = false,
  actionRef,
  onEdit,
  onDelete,
  onView,
}) => {
  const getModuleInfo = (permissionKey: string) => {
    return mockAvailableModules.find((module) => module.key === permissionKey);
  };

  const getUserCountColor = (count: number) => {
    if (count === 0) return 'default';
    if (count <= 2) return 'blue';
    if (count <= 5) return 'green';
    return 'red';
  };

  const columns: ProColumns<Role>[] = [
    {
      title: 'Nama Role',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (_, record) => (
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#fd0017',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {record.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <Text strong style={{ fontSize: '14px' }}>
              {record.name}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.unitName}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 300,
      render: (_, record) => {
        if (record.permissions.length === 0) {
          return <Badge status="default" text="Tidak ada permission" />;
        }

        const visibleCount = 3;
        const visiblePermissions = record.permissions.slice(0, visibleCount);
        const remainingCount = record.permissions.length - visibleCount;

        return (
          <Space wrap size={[4, 4]}>
            {visiblePermissions.map((permission) => {
              const moduleInfo = getModuleInfo(permission);
              return (
                <Tooltip
                  key={permission}
                  title={moduleInfo?.description || permission}
                >
                  <Tag style={{ margin: '2px', fontSize: '11px' }} color="blue">
                    {moduleInfo?.icon} {moduleInfo?.name || permission}
                  </Tag>
                </Tooltip>
              );
            })}
            {remainingCount > 0 && (
              <Tooltip title={`${remainingCount} permission lainnya`}>
                <Tag
                  style={{ margin: '2px', fontSize: '11px' }}
                  color="default"
                >
                  +{remainingCount}
                </Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
      filterMode: 'tree',
      filters: mockAvailableModules.map((module) => ({
        text: `${module.icon} ${module.name}`,
        value: module.key,
      })),
      onFilter: (value, record) => record.permissions.includes(value as string),
    },
    {
      title: 'Pengguna',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{ textAlign: 'center' }}>
          <UserOutlined style={{ fontSize: '16px', color: '#fd0017' }} />
          <Badge
            count={record.userCount}
            style={{
              backgroundColor:
                getUserCountColor(record.userCount) === 'default'
                  ? '#d9d9d9'
                  : undefined,
            }}
            color={getUserCountColor(record.userCount)}
          />
        </Space>
      ),
      sorter: (a, b) => a.userCount - b.userCount,
    },
    {
      title: 'Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      valueType: 'dateTime',
      render: (_, record) => {
        const date = new Date(record.createdAt);
        return (
          <div style={{ fontSize: '12px' }}>
            <div>{date.toLocaleDateString('id-ID')}</div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </div>
        );
      },
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Diperbarui',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      valueType: 'dateTime',
      render: (_, record) => {
        const date = new Date(record.updatedAt);
        const isRecent = Date.now() - date.getTime() < 24 * 60 * 60 * 1000; // 24 hours

        return (
          <div style={{ fontSize: '12px' }}>
            <div style={{ color: isRecent ? '#52c41a' : undefined }}>
              {date.toLocaleDateString('id-ID')}
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isRecent && (
              <Badge status="success" style={{ fontSize: '10px' }} />
            )}
          </div>
        );
      },
      sorter: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {onView && (
            <Tooltip title="Lihat Detail">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onView(record)}
              />
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit Role">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Hapus Role">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record)}
                disabled={record.userCount > 0}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ProTable<Role>
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} dari ${total} role`,
      }}
      search={{
        labelWidth: 'auto',
        defaultCollapsed: false,
      }}
      dateFormatter="string"
      headerTitle="Daftar Role"
      size="small"
      scroll={{ x: 1200 }}
      options={{
        reload: true,
        density: true,
        setting: true,
      }}
    />
  );
};

export default RoleTable;
