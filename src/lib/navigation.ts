import { hasPermission } from './permissions';

export interface NavItem {
  label: string;
  path: string;
  permission?: string;
  requiredRoles?: string[];
  children?: NavItem[];
}

export const MENU_STRUCTURE: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  {
    label: 'Berita (News)',
    path: '/admin/berita',
    permission: 'CanManageNews',
    children: [
      { label: 'Manage Berita', path: '/admin/berita' },
      { label: 'Manage Category', path: '/admin/berita/categories' },
    ]
  },
  {
    label: 'Kegiatan (Event)',
    path: '/admin/kegiatan',
    permission: 'CanManageEvents',
    children: [
      { label: 'Manage Kegiatan', path: '/admin/kegiatan' },
      { label: 'Manage Category', path: '/admin/kegiatan/categories' },
    ]
  },
  {
    label: 'Akademik',
    path: '/admin/akademik',
    permission: 'CanManageAcademics',
    children: [
      { label: 'Manage Akademik', path: '/admin/akademik' },
      { label: 'Placeholder', path: '/admin/akademik/placeholder' },
    ]
  },
  { label: 'Biaya Kuliah', path: '/admin/biaya', permission: 'CanManageAdmissionCost' },
  { label: 'Jadwal Admisi', path: '/admin/admisi/jadwal', permission: 'CanManageAdmission' },
  {
    label: 'Media Library',
    path: '/admin/media',
    permission: 'CanManageMedia',
    children: [
      { label: 'Manage Media', path: '/admin/media' },
      { label: 'Manage Media Category', path: '/admin/media/category' },
    ]
  },
  {
    label: 'Manajemen Personalia',
    path: '/admin/personalia',
    permission: 'CanManagePersonalia',
    children: [
      { label: 'Pengurus Yayasan', path: '/admin/pengurus-yayasan', permission: 'CanManageAdministrator' },
      { label: 'Dosen (Lecturer)', path: '/admin/dosen', permission: 'CanManageLecturers' },
    ]
  },
  {
    label: 'Keamanan & Akses',
    path: '/admin/keamanan',
    requiredRoles: ['SuperAdmin'],
    children: [
      { label: 'User System', path: '/admin/user', permission: 'CanManageUsers' },
      { label: 'Role Group', path: '/admin/role' },
      { label: 'Permission Key', path: '/admin/permission' },
    ]
  },
  { label: 'Halaman', path: '/admin/halaman', permission: 'CanManagePages' },
  { label: 'API Status', path: '/admin/status', permission: 'CanManageUsers' },
];

/**
 * Finds the first path a user has permission to access
 */
export function getFirstAuthorizedPath(userRoles: string[]): string {
  function findPath(items: NavItem[]): string | null {
    for (const item of items) {
      if (hasPermission(userRoles, item.permission, item.requiredRoles)) {
        // If it has a direct path and no children, or if we want to prioritize its own path
        if (!item.children || item.children.length === 0) {
          return item.path;
        }
        // If it's a group, check children
        const childPath = findPath(item.children);
        if (childPath) return childPath;

        // If children are all restricted but parent was "ok" (unlikely with new logic), return parent path
        return item.path;
      }
    }
    return null;
  }

  return findPath(MENU_STRUCTURE) || '/admin/dashboard';
}
