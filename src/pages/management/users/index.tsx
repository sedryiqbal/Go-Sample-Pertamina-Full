import { UserOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Space, Tag } from 'antd';
import { createStyles } from 'antd-style';
import React, { useRef } from 'react';
import { fetchRoles, searchUsers } from '@/services/users/api';
import type { UserListItem } from '@/services/users/typings';

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
    </PageContainer>
  );
};

export default Users;
