import { getCurrentUser } from './auth';

/**
 * Frontend Role & Permission Mapping
 * @deprecated Use dynamic backend-driven permissions from search results instead.
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {};

/**
 * Checks if a user has a specific permission based on backend response.
 */
export function hasPermission(unused_userRoles: string[], requiredPermission?: string, requiredRoles?: string[]): boolean {
  // Get current user from storage
  const user = getCurrentUser();
  if (!user) return false;

  // Bypass for SuperAdmin role
  if (user.roles && user.roles.includes('SuperAdmin')) return true;

  // If specific roles are required, check them first
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user.roles?.some(role => requiredRoles.includes(role));
    if (!hasRequiredRole) return false;
  }

  // If no permission required (but role check passed or wasn't needed), allow access
  if (!requiredPermission) return true;

  // Check explicit permissions
  return user.permissions?.includes(requiredPermission) || false;
}

/**
 * Checks if a user has access based on role names (legacy support)
 */
export function hasRoleAccess(userRoles: string[], allowedRoles?: string[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return userRoles.some(role => allowedRoles.includes(role));
}
