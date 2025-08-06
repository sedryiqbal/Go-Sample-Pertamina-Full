import type { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // Pertamina red color
  colorPrimary: '#fd0017',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: '',
  pwa: true,
  logo: '/logo.svg',
  iconfontUrl: '',
  token: {
    colorPrimary: '#fd0017',
  },
};

export default Settings;
