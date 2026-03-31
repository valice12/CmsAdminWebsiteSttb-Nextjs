import { hasPermission } from './permissions';

export interface NavItem {
  label: string;
  path: string;
  permission?: string;
}

export const MENU_STRUCTURE: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', permission: 'view_dashboard' },
  { label: 'Berita (News)', path: '/admin/berita', permission: 'CanManageNews' },
  { label: 'Kegiatan (Event)', path: '/admin/kegiatan', permission: 'CanManageEvents' },
  { label: 'Akademik', path: '/admin/akademik', permission: 'CanManageAcademics' },
  { label: 'Biaya Kuliah', path: '/admin/biaya', permission: 'CanManageAdmissionCost' },
  { label: 'Jadwal Admisi', path: '/admin/admisi/jadwal', permission: 'CanManageEvents' },
  { label: 'Media Library', path: '/admin/media', permission: 'CanManageMedia' },
  { label: 'Pengurus Yayasan', path: '/admin/pengurus-yayasan', permission: 'CanManageAdministrator' },
  { label: 'Dosen (Lecturer)', path: '/admin/dosen', permission: 'CanManageLecturers' },
  { label: 'User System', path: '/admin/user', permission: 'CanManageUsers' },
  { label: 'Role & Permission', path: '/admin/role', permission: 'CanManageAdministrator' },
  { label: 'Halaman', path: '/admin/halaman', permission: 'CanManageNews' },
  { label: 'API Status', path: '/admin/status', permission: 'CanManageUsers' },
];

/**
 * Finds the first path a user has permission to access
 */
export function getFirstAuthorizedPath(userRoles: string[]): string {
  for (const item of MENU_STRUCTURE) {
    if (hasPermission(userRoles, item.permission)) {
      return item.path;
    }
  }
  return '/admin/dashboard'; // Fallback
}
