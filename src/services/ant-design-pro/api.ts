// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export interface LoginResponseUser {
  id?: number | string;
  nama?: string;
  name?: string;
  email?: string;
  roleName?: string;
  isSuperadmin?: boolean;
  phone?: string;
  status?: string;
  [key: string]: any;
}

export interface LoginResponse {
  code: string;
  status: boolean;
  message: string;
  data?: {
    token: string;
    refreshToken?: string;
    expiresAt?: string;
    user?: LoginResponseUser;
    [key: string]: any;
  };
  timestamp?: string;
  [key: string]: any;
}

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return {
      success: true,
      data: {
        name: 'Serati Ma',
        avatar:
          'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        userid: '00000001',
        email: 'antdesign@alipay.com',
        signature: '海纳百川，有容乃大',
        title: '交互专家',
        group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
        tags: [
          {
            key: '0',
            label: '很有想法的',
          },
          {
            key: '1',
            label: '专注设计',
          },
          {
            key: '2',
            label: '辣~',
          },
          {
            key: '3',
            label: '大长腿',
          },
          {
            key: '4',
            label: '川妹子',
          },
          {
            key: '5',
            label: '海纳百川',
          },
        ],
        notifyCount: 12,
        unreadCount: 11,
        country: 'China',
        geographic: {
          province: {
            label: '浙江省',
            key: '330000',
          },
          city: {
            label: '杭州市',
            key: '330100',
          },
        },
        address: '西湖区工专路 77 号',
        phone: '0752-268888888',
      },
    }
  // return request<{
  //   data: API.CurrentUser;
  // }>('/api/currentUser', {
  //   method: 'GET',
  //   ...(options || {}),
  // });
}

export interface LogoutResponse {
  code: string;
  status: boolean;
  message: string;
  data?: {
    message?: string;
    [key: string]: any;
  };
  timestamp?: string;
  [key: string]: any;
}

/** 退出登录接口 POST /api/Auth/logout */
export async function outLogin(options?: { [key: string]: any }) {
  return request<LogoutResponse>('/api/Auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {},
    ...(options || {}),
  });
}

/** 登录接口 POST /api/auth/login */
export async function login(
  body: Pick<API.LoginParams, 'email' | 'password'>,
  options?: { [key: string]: any },
) {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}
