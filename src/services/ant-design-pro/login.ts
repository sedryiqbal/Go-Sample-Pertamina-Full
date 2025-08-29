// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 发送验证码 POST /api/login/captcha */
export async function getFakeCaptcha(
  params: {
    // query
    /** 手机号 */
    phone?: string;
  },
  options?: { [key: string]: any },
) {
  return {
    code: 0,
    data: {
      captcha: '1234',
    },
  };
  // return request<API.FakeCaptcha>('/api/login/captcha', {
  //   method: 'GET',
  //   params: {
  //     ...params,
  //   },
  //   ...(options || {}),
  // });
}
