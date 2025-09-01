/**
 * @name Umi route configuration
 * @description Only supports configuration for path, component, routes, redirect, wrappers, name, and icon.
 * @param path  The path only supports two types of placeholders: dynamic parameters in the form of :id, and the * wildcard, which can only appear at the end of the route string.
 * @param component The React component path to render when the location matches the path. Can be an absolute or relative path. If relative, it will be resolved from src/pages.
 * @param routes Configure sub-routes, usually used when you need to add a layout component for multiple paths.
 * @param redirect Configure route redirection.
 * @param wrappers Configure wrapper components for the route component. Wrappers can be used to add more features to the current route component, such as route-level permission checks.
 * @param name Configure the route title. By default, it reads the value from the internationalization file menu.ts as menu.xxxx. For example, if name is set to login, it will read the value of menu.login in menu.ts as the title.
 * @param icon Configure the route icon. Refer to https://ant.design/components/icon-cn. Remove the style suffix and use either lowercase or capitalized names. For example, to use <StepBackwardOutlined />, use stepBackward or StepBackward. To use <UserOutlined />, use user or User.
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        layout: false,
        name: 'login',
        component: './user/login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
    ],
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    icon: 'dashboard',
    component: './dashboard',
  },
  {
    path: '/management',
    name: 'management',
    icon: 'setting',
    routes: [
      {
        name: 'users',
        icon: 'user',
        path: '/management/users',
        component: './management/users',
      },
      {
        name: 'ships',
        icon: 'car',
        path: '/management/ships',
        component: './management/ships',
      },
      {
        name: 'roles',
        icon: 'safety',
        path: '/management/roles',
        component: './management/roles',
      },
    ],
  },
  {
    path: '/stock',
    name: 'Stock',
    icon: 'database',
    routes: [
      {
        name: 'Estimate Scheduling Sample',
        icon: 'line-chart',
        path: '/stock/estimate-scheduling',
        component: './stock/estimate-scheduling',
      },
    ],
  },
  // {
  //   path: '/estimate-scheduling-sample',
  //   name: 'Estimate Scheduling Sample',
  //   icon: 'shopping',
  //   component: './estimate-scheduling-sample',
  // },
  {
    path: '/laboratory',
    name: 'laboratory',
    icon: 'experiment',
    routes: [
      {
        name: 'testing',
        icon: 'interaction',
        path: '/laboratory/testing',
        component: './laboratory/testing',
      },
      {
        path: '/laboratory/testing/detail/:id',
        name: 'testing-detail',
        component: './laboratory/testing/detail',
        hideInMenu: true,
      },
    ],
  },
  {
    path: '/comparison',
    name: 'comparison',
    icon: 'diff',
    component: './comparison',
  },
  {
    path: '/request-order',
    name: 'request-order',
    icon: 'form',
    component: './request-order',
  },
  {
    path: '/monitoring',
    name: 'monitoring',
    icon: 'eye',
    routes: [
      {
        path: '/monitoring',
        component: './monitoring',
      },
      {
        path: '/monitoring/detail/:id',
        name: 'monitoring-detail',
        component: './monitoring/detail',
        hideInMenu: true,
      },
    ],
  },
  {
    path: '/reports',
    name: 'reports',
    icon: 'download',
    component: './reports',
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
];
