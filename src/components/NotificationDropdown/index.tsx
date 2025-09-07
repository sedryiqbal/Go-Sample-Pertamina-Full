import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Drawer,
  List,
  message,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useState } from 'react';

dayjs.extend(relativeTime);

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  category: 'sample' | 'system' | 'laboratory' | 'monitoring';
  data?: any;
};

const useStyles = createStyles(({ token }) => {
  return {
    notificationIcon: {
      display: 'flex',
      height: '48px',
      alignItems: 'center',
      padding: '0 12px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    notificationDrawer: {
      '.ant-drawer-header': {
        borderBottom: `1px solid ${token.colorBorder}`,
      },
    },
    notificationItem: {
      padding: '12px 16px',
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      cursor: 'pointer',
      transition: 'all 0.3s',
      '&:hover': {
        backgroundColor: token.colorBgContainer,
      },
      '&.unread': {
        backgroundColor: token.colorPrimaryBg,
        borderLeft: `3px solid ${token.colorPrimary}`,
      },
    },
    notificationTitle: {
      fontWeight: 500,
      fontSize: '14px',
      marginBottom: '4px',
      color: token.colorTextHeading,
    },
    notificationDesc: {
      fontSize: '12px',
      color: token.colorTextSecondary,
      marginBottom: '8px',
      lineHeight: '1.4',
    },
    notificationMeta: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '11px',
      color: token.colorTextTertiary,
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: token.colorTextSecondary,
    },
  };
});

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Sampel Baru Diterima',
    description:
      'Sampel JET A-1 dari MT. Commodore One telah diterima laboratorium',
    type: 'info',
    read: false,
    createdAt: '2025-08-29T10:30:00Z',
    category: 'sample',
    data: { sampleId: 'SMPL-20250829-001' },
  },
  {
    id: '2',
    title: 'Pengujian Selesai',
    description:
      'Pengujian sampel SMPL-20250829-001 telah selesai dengan hasil PASS',
    type: 'success',
    read: false,
    createdAt: '2025-08-29T09:45:00Z',
    category: 'laboratory',
    data: { sampleId: 'SMPL-20250829-001' },
  },
  {
    id: '3',
    title: 'Stock Rendah',
    description: 'Stock sampel Avgas dalam tangki T.203 tersisa 3 botol',
    type: 'warning',
    read: false,
    createdAt: '2025-08-29T08:15:00Z',
    category: 'system',
  },
  {
    id: '4',
    title: 'Pengiriman Terlambat',
    description: 'Pengiriman sampel RQ-20250828-005 mengalami keterlambatan',
    type: 'error',
    read: true,
    createdAt: '2025-08-28T16:20:00Z',
    category: 'monitoring',
  },
  {
    id: '5',
    title: 'Jadwal Maintenance',
    description: 'Alat Viscometer A akan maintenance besok pukul 14:00',
    type: 'info',
    read: true,
    createdAt: '2025-08-28T14:30:00Z',
    category: 'laboratory',
  },
];

const NotificationDropdown: React.FC = () => {
  const { styles } = useStyles();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'laboratory') return <ExperimentOutlined />;

    switch (type) {
      case 'success':
        return <CheckOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <DeleteOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sample':
        return 'blue';
      case 'laboratory':
        return 'green';
      case 'monitoring':
        return 'orange';
      case 'system':
        return 'red';
      default:
        return 'default';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    message.success('Semua notifikasi telah dibaca');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    message.success('Notifikasi telah dihapus');
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    markAsRead(notification.id);

    // Handle navigation based on notification type
    if (notification.category === 'sample' && notification.data?.sampleId) {
      // Navigate to sample detail or laboratory testing page
      message.info(`Navigasi ke detail sampel: ${notification.data.sampleId}`);
    }
  };

  const notificationContent = (
    <div>
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0 }}>Notifikasi</h3>
          {unreadCount > 0 && (
            <Button type="link" size="small" onClick={markAllAsRead}>
              Tandai Semua Dibaca
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className={styles.emptyState}>
          <BellOutlined
            style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }}
          />
          <div>Tidak ada notifikasi</div>
        </div>
      ) : (
        <List
          itemLayout="vertical"
          dataSource={notifications}
          renderItem={(item) => (
            <div
              key={item.id}
              className={`${styles.notificationItem} ${!item.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(item)}
            >
              <div className={styles.notificationTitle}>
                <Space>
                  {getNotificationIcon(item.type, item.category)}
                  {item.title}
                  {!item.read && <Badge status="processing" />}
                </Space>
              </div>
              <div className={styles.notificationDesc}>{item.description}</div>
              <div className={styles.notificationMeta}>
                <Space>
                  <Tag color={getCategoryColor(item.category)}>
                    {item.category}
                  </Tag>
                  <span>{dayjs(item.createdAt).fromNow()}</span>
                </Space>
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  style={{ color: '#999' }}
                />
              </div>
            </div>
          )}
        />
      )}
    </div>
  );

  return (
    <>
      <Tooltip title="Notifikasi">
        <div
          className={styles.notificationIcon}
          onClick={() => setDrawerVisible(true)}
        >
          <Badge count={unreadCount} size="small">
            <BellOutlined style={{ fontSize: '16px' }} />
          </Badge>
        </div>
      </Tooltip>

      <Drawer
        title="Notifikasi"
        width={400}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        className={styles.notificationDrawer}
        placement="right"
      >
        {notificationContent}
      </Drawer>
    </>
  );
};

export default NotificationDropdown;
