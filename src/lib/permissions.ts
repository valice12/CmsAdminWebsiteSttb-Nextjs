/**
 * Frontend Role & Permission Mapping
 * This is used for UI conditional rendering (hiding/showing menus)
 * without requiring backend changes.
 */

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  'SuperAdmin': [
    'CanManageAdministrator',
    'CanManageNews',
    'CanManageAcademics',
    'CanManageMedia',
    'CanManageEvents',
    'CanManageUsers',
    'CanManageLecturers',
    'CanManageAdmissionCost',
    'view_dashboard'
  ],
  'Admin': [
    'CanManageNews',
    'CanManageAcademics',
    'CanManageMedia',
    'CanManageEvents',
    'CanManageLecturers',
    'CanManageAdmissionCost',
    'view_dashboard'
  ],
  'Admin Akademik': [
    'CanManageAcademics',
    'view_dashboard'
  ],
  'Admin Media': [
    'CanManageMedia',
    'view_dashboard'
  ],
  'Admin Berita': [
    'CanManageNews',
    'CanManageEvents',
    'CanManageMedia',
    'view_dashboard'
  ],
  'Admin Keuangan': [
    'CanManageAdmissionCost',
    'view_dashboard'
  ],
  'KEUANGAN': [
    'CanManageAdmissionCost',
    'view_dashboard'
  ],
  'Admin Event': [
    'CanManageEvents',
    'view_dashboard'
  ],
  'Dosen': [
    'CanManageLecturers',
    'view_dashboard'
  ],
  'Pengurus Yayasan': [
    'CanManageAdministrator',
    'view_dashboard'
  ]
};

/**
 * Checks if a user with given roles has a specific permission.
 */
export function hasPermission(userRoles: string[], requiredPermission?: string): boolean {
  // If no permission required, allow access
  if (!requiredPermission) return true;

  // Flatten all permissions for all roles the user has
  const userPermissions = new Set<string>();
  userRoles.forEach(role => {
    const perms = ROLE_PERMISSIONS[role] || [];
    perms.forEach(p => userPermissions.add(p));
  });

  return userPermissions.has(requiredPermission) || userPermissions.has('SuperAdmin');
}

/**
 * Checks if a user has access based on role names (legacy support)
 */
export function hasRoleAccess(userRoles: string[], allowedRoles?: string[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return userRoles.some(role => allowedRoles.includes(role));
}
