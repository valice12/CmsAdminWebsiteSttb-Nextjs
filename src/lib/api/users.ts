import { cmsFetch, CMS_BASE_URL } from './base';

export async function registerUser(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/register`, {
    method: 'POST',
    body: JSON.stringify({
      FullName: data.fullName,
      Email: data.email,
      RoleName: data.roleName,
      Password: data.password
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to register user');
  }
  return response.json();
}

export async function getAllUsers(page = 1, pageSize = 100, search = '') {
  const query = new URLSearchParams({
    PageNumber: page.toString(),
    PageSize: pageSize.toString(),
  });
  if (search) {
    query.append('UserName', search);
  }

  const response = await cmsFetch(`${CMS_BASE_URL}/users/get-all-users?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function getUserById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/users/get-user/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

export async function updateUser(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/users/edit-user`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  return response.json();
}

export async function deleteUser(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/users/delete-user/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
  // Return early for 204 No Content
  if (response.status === 204) {
    return;
  }
  return response.json().catch(() => ({}));
}

// ─── Roles ───────────────────────────────────────────────────────────────────

export async function getAllRoles(page = 1, pageSize = 100, search = '') {
  const query = new URLSearchParams({
    PageNumber: page.toString(),
    PageSize: pageSize.toString(),
  });
  if (search) {
    query.append('RoleName', search);
  }

  const response = await cmsFetch(`${CMS_BASE_URL}/users/get-all-roles?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch roles');
  }
  return response.json();
}

export async function addRole(name: string, permissions: string[] = []) {
  const response = await cmsFetch(`${CMS_BASE_URL}/users/add-role`, {
    method: 'POST',
    body: JSON.stringify({ RoleName: name, RolePermissions: permissions }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add role');
  }
  return response.json();
}

export async function updateRole(id: number, name: string, permissions: { id: number, name: string }[]) {
  const rolePermissionsDTOs = permissions.map(p => ({
    Id: p.id,
    PermissionName: p.name
  }));
  const response = await cmsFetch(`${CMS_BASE_URL}/users/edit-role`, {
    method: 'PUT',
    body: JSON.stringify({ Id: id, RoleName: name, RolePermissions: rolePermissionsDTOs }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update role');
  }
  return response.json();
}

export async function deleteRole(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/users/delete-role/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete role');
  }
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export async function getAllPermissions(page = 1, pageSize = 99, search = '') {
  const query = new URLSearchParams({
    PageNumber: page.toString(),
    PageSize: pageSize.toString(),
  });
  if (search) {
    query.append('PermissionName', search);
  }

  const response = await cmsFetch(`${CMS_BASE_URL}/users/get-all-permissions?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch permissions');
  }
  return response.json();
}

export async function addPermission(name: string) {
  const response = await cmsFetch(`${CMS_BASE_URL}/users/add-permission`, {
    method: 'POST',
    body: JSON.stringify({ PermissionName: name }),
  });
  if (!response.ok) {
    throw new Error('Failed to add permission');
  }
  return response.json();
}

export async function deletePermission(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/users/delete-permission/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete permission');
  }
}
