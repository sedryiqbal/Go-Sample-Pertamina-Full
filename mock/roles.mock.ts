import type { AvailableModule, Role, RoleListResponse } from '../src/services/roles/typings';

// Mock available modules
export const mockAvailableModules: AvailableModule[] = [
  {
    key: 'orders',
    name: 'Orders',
    description: 'Pengelolaan pesanan/order sampel',
    icon: '🛒',
  },
  {
    key: 'samples',
    name: 'Samples',
    description: 'Pengelolaan sampel dan tracking',
    icon: '🧪',
  },
  {
    key: 'lab',
    name: 'Laboratory',
    description: 'Pengelolaan laboratorium dan equipment',
    icon: '🔬',
  },
  {
    key: 'tests',
    name: 'Tests',
    description: 'Pengelolaan jenis tes dan prosedur',
    icon: '⚗️',
  },
  {
    key: 'results',
    name: 'Results',
    description: 'Pengelolaan hasil tes dan reporting',
    icon: '📊',
  },
  {
    key: 'users',
    name: 'Users',
    description: 'Pengelolaan pengguna dan akses',
    icon: '👥',
  },
  {
    key: 'dashboard',
    name: 'Dashboard',
    description: 'Dashboard dan analytics',
    icon: '📈',
  },
  {
    key: 'reports',
    name: 'Reports',
    description: 'Laporan dan export data',
    icon: '📄',
  },
  {
    key: 'roles',
    name: 'Roles',
    description: 'Pengelolaan role dan permissions',
    icon: '🔐',
  },
  {
    key: 'ships',
    name: 'Ships',
    description: 'Pengelolaan kapal dan vessel',
    icon: '🚢',
  },
  {
    key: 'units',
    name: 'Units',
    description: 'Pengelolaan unit organisasi',
    icon: '🏢',
  },
];

// Mock roles data
export const mockRoles: Role[] = [
  {
    id: 'c8598695-3df7-439c-981b-832950cb8be6',
    name: 'Sample Officer',
    permissions: ['orders', 'samples', 'dashboard', 'reports'],
    unitId: 'ce587291-31a8-488d-9fd0-140749d2137b',
    unitName: 'SHAFTI',
    createdAt: '2025-08-17T08:01:35.505177',
    updatedAt: '2025-08-17T08:01:35.505177',
    userCount: 5,
  },
  {
    id: '0ba8a2e3-f6c5-4dd6-a031-22a2160d9e44',
    name: 'Sample Officer Sajo',
    permissions: [],
    unitId: 'ce587291-31a8-488d-9fd0-140749d2137b',
    unitName: 'SHAFTI',
    createdAt: '2025-08-20T12:44:38.71525',
    updatedAt: '2025-08-20T12:44:38.715251',
    userCount: 0,
  },
  {
    id: 'e56dbbac-6e77-4422-9b44-07b4d400b78d',
    name: 'Sample Officer Sajo2',
    permissions: [],
    unitId: 'ce587291-31a8-488d-9fd0-140749d2137b',
    unitName: 'SHAFTI',
    createdAt: '2025-08-20T12:45:37.367384',
    updatedAt: '2025-08-20T12:45:37.367384',
    userCount: 0,
  },
  {
    id: 'a999a385-ead0-437d-bd52-400c1317c514',
    name: 'Sample Officer Sajo23',
    permissions: ['orders', 'samples'],
    unitId: 'ce587291-31a8-488d-9fd0-140749d2137b',
    unitName: 'SHAFTI',
    createdAt: '2025-08-20T12:50:43.119555',
    updatedAt: '2025-08-20T12:50:43.119555',
    userCount: 2,
  },
  {
    id: 'c4672a21-1fbb-4c49-9eb9-958662086482',
    name: 'Supervisor',
    permissions: ['orders', 'samples', 'users', 'dashboard', 'reports'],
    unitId: 'ce587291-31a8-488d-9fd0-140749d2137b',
    unitName: 'SHAFTI',
    createdAt: '2025-08-17T08:01:35.505175',
    updatedAt: '2025-08-17T08:01:35.505175',
    userCount: 3,
  },
  {
    id: 'lab-manager-001',
    name: 'Lab Manager',
    permissions: ['lab', 'tests', 'results', 'dashboard', 'reports'],
    unitId: 'ce587291-31a8-488d-9fd0-140749d2137b',
    unitName: 'SHAFTI',
    createdAt: '2025-08-15T08:01:35.505175',
    updatedAt: '2025-08-15T08:01:35.505175',
    userCount: 2,
  },
  {
    id: 'admin-001',
    name: 'Administrator',
    permissions: ['orders', 'samples', 'lab', 'tests', 'results', 'users', 'dashboard', 'reports', 'roles', 'ships', 'units'],
    unitId: 'ce587291-31a8-488d-9fd0-140749d2137b',
    unitName: 'SHAFTI',
    createdAt: '2025-08-10T08:01:35.505175',
    updatedAt: '2025-08-10T08:01:35.505175',
    userCount: 1,
  },
];

export const mockRoleListResponse: RoleListResponse = {
  data: mockRoles,
  totalCount: mockRoles.length,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

// Helper function to filter roles based on query
export function filterRoles(roles: Role[], query?: string): Role[] {
  if (!query) return roles;
  
  const lowercaseQuery = query.toLowerCase();
  return roles.filter(role => 
    role.name.toLowerCase().includes(lowercaseQuery) ||
    role.unitName.toLowerCase().includes(lowercaseQuery) ||
    role.permissions.some(permission => permission.toLowerCase().includes(lowercaseQuery))
  );
} 