import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Badge, Button, message, Space, Tag, Tooltip, Typography } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { searchRoles } from '@/services/roles/api';
import type { Role } from '@/services/roles/typings';
import { mockAvailableModules } from '../../../../../mock/roles.mock';

const { Text } = Typography;

interface RoleTableProps {
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  onEdit?: (record: Role) => void;
  onDelete?: (record: Role) => void;
  onView?: (record: Role) => void;
}

const RoleTable: React.FC<RoleTableProps> = ({
  actionRef,
  onEdit,
  onDelete,
  onView,
}) => {
  const moduleMetaMap = useMemo(() => {
    const map = new Map<string, (typeof mockAvailableModules)[number]>();
    mockAvailableModules.forEach((module) => {
      map.set(module.key, module);
    });
    return map;
  }, []);

  const formatModuleLabel = useCallback(
    (key: string) => {
      const meta = moduleMetaMap.get(key);
      if (meta) {
        return meta.name;
      }
      return key
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    },
    [moduleMetaMap],
  );

  const formatActionLabel = useCallback(
    (action: string) =>
      action
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    [],
  );

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
      width: 220,
      fieldProps: {
        placeholder: 'Cari berdasarkan nama role',
      },
      search: {
        transform: (value: string) => ({ name: value }),
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
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
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 360,
      hideInSearch: true,
      render: (_, record) => {
        const details = record.permissionsDetail ?? [];
        if (details.length === 0) {
          return <Badge status="default" text="Tidak ada permission" />;
        }

        const visibleCount = 3;
        const visiblePermissions = details.slice(0, visibleCount);
        const remainingCount = details.length - visibleCount;

        return (
          <Space wrap size={[6, 6]}>
            {visiblePermissions.map(({ module, actions }) => {
              const moduleMeta = moduleMetaMap.get(module);
              const moduleLabel = moduleMeta?.name || formatModuleLabel(module);
              const formattedActions =
                actions && actions.length > 0
                  ? actions
                      .map((action) => formatActionLabel(action))
                      .join(', ')
                  : 'Tidak ada aksi';

              return (
                <Tooltip
                  key={module}
                  title={
                    <div>
                      {moduleMeta?.description && (
                        <div style={{ marginBottom: 4 }}>
                          {moduleMeta.description}
                        </div>
                      )}
                      <div>
                        <strong>Aksi:</strong> {formattedActions}
                      </div>
                    </div>
                  }
                >
                  <Tag
                    color="blue"
                    style={{
                      margin: 0,
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>{moduleMeta?.icon || '📁'}</span>
                    <span>{moduleLabel}</span>
                  </Tag>
                </Tooltip>
              );
            })}
            {remainingCount > 0 && (
              <Tooltip title={`${remainingCount} permission lainnya`}>
                <Tag color="default" style={{ fontSize: '11px', margin: 0 }}>
                  +{remainingCount}
                </Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Pengguna',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 140,
      align: 'center',
      hideInSearch: true,
      sorter: (a, b) => a.userCount - b.userCount,
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
    },
    {
      title: 'Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Diperbarui',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      render: (_, record) => {
        const date = new Date(record.updatedAt);
        const isRecent = Date.now() - date.getTime() < 24 * 60 * 60 * 1000;
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
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 160,
      fixed: 'right',
      hideInSearch: true,
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
      request={async (params) => {
        const { current = 1, pageSize = 10, name } = params;
        try {
          const result = await searchRoles({
            page: current,
            pageSize,
            name,
          });

          return {
            data: result.list,
            total: result.total,
            success: true,
          };
        } catch (error: any) {
          message.error(
            error?.message || 'Terjadi kesalahan saat memuat data role',
          );
          return {
            data: [],
            total: 0,
            success: false,
          };
        }
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
