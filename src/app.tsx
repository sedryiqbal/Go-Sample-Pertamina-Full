import { LinkOutlined } from '@ant-design/icons';
import type {
  MenuDataItem,
  Settings as LayoutSettings,
} from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import React from 'react';
import {
  AvatarDropdown,
  AvatarName,
  Footer,
} from '@/components';
import { API_BASE_URL } from '@/config/api';
import type { AuthMenuItem } from '@/services/auth/api';
import { fetchProfile, fetchUserMenus } from '@/services/auth/api';
import { clearAuthToken, hasAuthToken } from '@/utils/auth';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import '@ant-design/v5-patch-for-react-19';

// const isDev = process.env.NODE_ENV === 'development' || process.env.CI;
const isDev = false;
const loginPath = '/login';

const MENU_PATH_ALIASES: Record<string, string[]> = {
  '/users': ['/management/users'],
  '/roles': ['/management/roles'],
  '/labs': ['/laboratory', '/laboratory/testing', '/laboratory/harga'],
  '/samples': ['/sample', '/sample/estimation', '/sample/order'],
  '/orders': ['/sample/order'],
  '/settings': ['/account/change-password'],
  '/stadis': ['/stadis'],
  '/syringe': ['/laboratory/syringe'],
};

const normalizePath = (path?: string) => {
  if (!path) {
    return '';
  }
  if (path === '/') {
    return '/';
  }
  return path.replace(/\/+$/, '').toLowerCase();
};

const buildAllowedMenuPaths = (menus?: AuthMenuItem[]) => {
  const allowed = new Set<string>();
  (menus ?? []).forEach((menu) => {
    const normalizedUrl = normalizePath(menu.url);
    if (normalizedUrl) {
      allowed.add(normalizedUrl);
      (MENU_PATH_ALIASES[normalizedUrl] ?? []).forEach((aliasPath) => {
        const normalizedAlias = normalizePath(aliasPath);
        if (normalizedAlias) {
          allowed.add(normalizedAlias);
        }
      });
    }
  });
  return allowed;
};

const filterMenuDataByAccess = (
  menuData: MenuDataItem[],
  allowedPaths: Set<string>,
) => {
  if (!allowedPaths.size) {
    return menuData;
  }

  const loopFilter = (items: MenuDataItem[]): MenuDataItem[] =>
    items
      .map((item) => {
        const children = item.children ? loopFilter(item.children) : [];
        const normalizedPath = normalizePath(
          typeof item.path === 'string' ? item.path : undefined,
        );
        const keepItem =
          children.length > 0 ||
          (normalizedPath ? allowedPaths.has(normalizedPath) : false);

        if (!keepItem) {
          return null;
        }

        return {
          ...item,
          children,
        };
      })
      .filter((item): item is MenuDataItem => Boolean(item));

  return loopFilter(menuData);
};

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  currentMenus?: AuthMenuItem[];
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  fetchUserMenus?: () => Promise<AuthMenuItem[]>;
}> {
  const fetchUserInfo = async () => {
    if (!hasAuthToken()) {
      return undefined;
    }
    try {
      const profile = await fetchProfile();
      if (!profile) {
        return undefined;
      }
      return {
        name: profile.name,
        email: profile.email,
        userid: profile.id,
        username: profile.username,
        access: profile.superAdmin ? 'admin' : profile.roleName,
        roleName: profile.roleName,
        unitName: profile.unitName,
        superAdmin: profile.superAdmin,
      } as API.CurrentUser & {
        roleName?: string;
        unitName?: string;
        superAdmin?: boolean;
        username?: string;
      };
    } catch (_error) {
      clearAuthToken();
      if (history.location.pathname !== loginPath) {
        history.push(loginPath);
      }
    }
    return undefined;
  };
  const fetchMenus = async () => {
    if (!hasAuthToken()) {
      return [];
    }
    try {
      return await fetchUserMenus();
    } catch (_error) {
      return [];
    }
  };
  // 如果不是登录页面，执行
  const { location } = history;
  const noAuthRequiredPaths = [
    loginPath,
    '/user/login',
    '/user/register',
    '/user/register-result',
  ];

  const baseInitialState = {
    fetchUserInfo,
    fetchUserMenus: fetchMenus,
    settings: defaultSettings as Partial<LayoutSettings>,
  };

  if (!noAuthRequiredPaths.includes(location.pathname)) {
    if (!hasAuthToken()) {
      history.push(loginPath);
      return {
        ...baseInitialState,
        currentMenus: [],
      };
    }
    const [currentUser, currentMenus] = await Promise.all([
      fetchUserInfo(),
      fetchMenus(),
    ]);
    return {
      ...baseInitialState,
      currentUser,
      currentMenus,
    };
  }
  return {
    ...baseInitialState,
    currentMenus: [],
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  const allowedMenuPaths = buildAllowedMenuPaths(initialState?.currentMenus);
  return {
    actionsRender: () => [],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      // content: initialState?.currentUser?.name,
      content: '',
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      const isLoginRoute = [loginPath, '/user/login'].includes(
        location.pathname,
      );
      if (!hasAuthToken() && !isLoginRoute) {
        history.push(loginPath);
        return;
      }

      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && !isLoginRoute) {
        initialState?.fetchUserInfo?.();
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
        <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
          <LinkOutlined />
          <span>OpenAPI 文档</span>
        </Link>,
      ]
      : [],
    menuHeaderRender: undefined,
    menuDataRender: (menuData: MenuDataItem[] = []) =>
      filterMenuDataByAccess(menuData, allowedMenuPaths),
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  baseURL: API_BASE_URL,
  ...errorConfig,
};
