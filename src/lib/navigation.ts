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
    label: 'Berita',
    path: '/admin/berita',
    permission: 'CanManageNews',
    children: [
      { label: 'Kelola Berita', path: '/admin/berita' },
      { label: 'Kelola Kategori', path: '/admin/berita/categories' },
    ]
  },
  {
    label: 'Kegiatan',
    path: '/admin/kegiatan',
    permission: 'CanManageEvents',
    children: [
      { label: 'Kelola Kegiatan', path: '/admin/kegiatan' },
      { label: 'Kelola Kategori', path: '/admin/kegiatan/categories' },
    ]
  },
  {
    label: 'Akademik',
    path: '/admin/akademik',
    permission: 'CanManageAcademicPrograms',
    children: [
      { label: 'Kelola Program Studi', path: '/admin/akademik' },
      { label: 'Kelola Mata Kuliah', path: '/admin/akademik/mata-kuliah' },
    ]
  },
  { 
    label: 'Biaya Kuliah', 
    path: '/admin/biaya', 
    permission: 'CanManageAdmissionCost',
    children: [
      { label: 'Kelola Biaya', path: '/admin/biaya' },
      { label: 'Kelola Kategori', path: '/admin/biaya/categories' },
    ]
  },
  { label: 'Jadwal Admisi', path: '/admin/admisi/jadwal', permission: 'CanManageAdmission' },
  {
    label: 'Media Library',
    path: '/admin/media',
    permission: 'CanManageMedia',
    children: [
      { label: 'Kelola Media', path: '/admin/media' },
      { label: 'Kelola Kategori Media', path: '/admin/media/categories' },
    ]
  },
  {
    label: 'Manajemen Person',
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
      { label: 'Kelola User', path: '/admin/user', permission: 'CanManageUsers' },
      { label: 'Kelola Role', path: '/admin/role' },
      { label: 'Kelola Permission', path: '/admin/permission' },
    ]
  },
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
