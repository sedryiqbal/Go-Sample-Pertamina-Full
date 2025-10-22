import {
  KeyOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import type { MenuProps } from 'antd';
import { message, Spin } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { flushSync } from 'react-dom';
import { outLogin } from '@/services/ant-design-pro/api';
import { clearAuthToken } from '@/utils/auth';
import HeaderDropdown from '../HeaderDropdown';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  return <span className="anticon">{currentUser?.name}</span>;
};

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
  };
});

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({
  menu,
  children,
}) => {
  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    try {
      const response = await outLogin({
        skipErrorHandler: true,
      });

      if (!response?.status) {
        throw new Error(
          response?.message ||
            response?.data?.message ||
            'Logout gagal, silakan coba lagi.',
        );
      }

      if (response?.message) {
        message.success(response.message);
      }
    } catch (error: any) {
      const logoutErrorMessage =
        error?.response?.data?.message ??
        error?.response?.data?.data?.message ??
        error?.message ??
        'Logout gagal, silakan coba lagi.';
      message.error(logoutErrorMessage);
    } finally {
      clearAuthToken();
      const { search, pathname } = window.location;
      const urlParams = new URL(window.location.href).searchParams;
      const searchParams = new URLSearchParams({
        redirect: pathname + search,
      });
      /** 此方法会跳转到 redirect 参数所在的位置 */
      const redirect = urlParams.get('redirect');
      // Note: There may be security issues, please note
      if (window.location.pathname !== '/login' && !redirect) {
        history.replace({
          pathname: '/login',
          search: searchParams.toString(),
        });
      }
    }
  };
  const { styles } = useStyles();

  const { initialState, setInitialState } = useModel('@@initialState');

  const onMenuClick: MenuProps['onClick'] = (event) => {
    const { key } = event;
    if (key === 'logout') {
      flushSync(() => {
        setInitialState((s) => ({ ...s, currentUser: undefined }));
      });
      loginOut();
      return;
    }
    if (key === 'change-password') {
      history.push('/account/change-password');
      return;
    }
    history.push(`/account/${key}`);
  };

  const loading = (
    <span className={styles.action}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.name) {
    return loading;
  }

  const menuItems = [
    ...(menu
      ? [
          {
            key: 'center',
            icon: <UserOutlined />,
            label: '个人中心',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '个人设置',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: 'Ubah Password',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};
