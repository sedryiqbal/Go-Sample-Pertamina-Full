import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Space, Tooltip, Typography } from 'antd';
import React from 'react';
import { searchRoles } from '@/services/roles/api';
import type { Role } from '@/services/roles/typings';

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
  const columns: ProColumns<Role>[] = [
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   key: 'id',
    //   width: 100,
    //   hideInSearch: true,
    //   sorter: (a, b) =>
    //     String(a.id ?? '').localeCompare(String(b.id ?? ''), 'id-ID', {
    //       numeric: true,
    //       sensitivity: 'base',
    //     }),
    //   render: (_, record) => <Text code>{record.id}</Text>,
    // },s
    {
      title: 'Nama Role',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      fieldProps: {
        placeholder: 'Cari berdasarkan nama role',
      },
      search: {
        transform: (value: string) => ({ name: value }),
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, record) => {
        const initial =
          record.name && record.name.length > 0
            ? record.name.charAt(0).toUpperCase()
            : '?';
        return (
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
              {initial}
            </div>
            <div>
              <Text strong style={{ fontSize: '14px' }}>
                {record.name}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      hideInSearch: true,
      ellipsis: true,
      render: (_, record) =>
        record.description ? (
          <Text>{record.description}</Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Diperbarui',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
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
              <Text type="success" style={{ fontSize: '10px' }}>
                Baru
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 140,
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
      scroll={{ x: 900 }}
      options={{
        reload: true,
        density: true,
        setting: true,
      }}
    />
  );
};

export default RoleTable;
