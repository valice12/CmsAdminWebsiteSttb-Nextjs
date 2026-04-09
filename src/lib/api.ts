const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5066/api/v1';
const CMS_BASE_URL = `${BASE_URL}/cms`;

// Helper: baca token JWT dari localStorage
function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const userJson = localStorage.getItem('cms_current_user');
  if (!userJson) return {};
  try {
    const user = JSON.parse(userJson);
    return user.token ? { 'Authorization': `Bearer ${user.token}` } : {};
  } catch {
    return {};
  }
}

/**
 * Unified fetch helper for CMS endpoints that automatically adds Auth headers
 * and handles common request patterns.
 */
async function cmsFetch(url: string, options: RequestInit = {}) {
  const authHeaders = getAuthHeaders();

  const headers: Record<string, string> = {
    ...authHeaders,
    ...(options.headers as Record<string, string>),
  };

  // Automatically set Content-Type to application/json if body is present and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    try {
      const errorData = await response.clone().json();
      console.error(`CMS API Error [${response.status}] ${url}:`, JSON.stringify(errorData, null, 2));
    } catch {
      const errorText = await response.clone().text();
      console.error(`CMS API Error [${response.status}] ${url}:`, errorText);
    }
  }

  return response;
}

export async function fetchWithTimeout(resource: string, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ─── News ────────────────────────────────────────────────────────────────────

export async function getAllNews(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/get-all-news?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) throw new Error('Failed to fetch news');
  return response.json();
}

export async function getNewsById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/get-news/${id}`);
  if (!response.ok) throw new Error('Failed to fetch news detail');
  return response.json();
}

export async function getAllNewsCategories() {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/get-all-categories`);
  if (!response.ok) throw new Error('Failed to fetch news categories');
  return response.json();
}

export async function addNews(formData: FormData) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/add-news`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to add news');
  return response.json();
}

export async function editNews(formData: FormData) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/edit-news`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to edit news');
  return response.json();
}

export async function deleteNews(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/delete-news/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete news');
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function getAllEvents(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/get-all-events?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

export async function getEventById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/get-event/${id}`);
  if (!response.ok) throw new Error('Failed to fetch event detail');
  return response.json();
}

export async function getAllEventCategories() {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/get-all-categories`);
  if (!response.ok) throw new Error('Failed to fetch event categories');
  return response.json();
}

export async function addEvent(formData: FormData) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/add-event`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to add event');
  return response.json();
}

export async function editEvent(formData: FormData) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/edit-event`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to edit event');
  return response.json();
}

export async function deleteEvent(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/delete-event/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete event');
}

// ─── Dashboards ───────────────────────────────────────────────────────────────

export async function getDashboardData() {
  const response = await cmsFetch(`${CMS_BASE_URL}/dashboards`);
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  return response.json();
}

// ─── Media ────────────────────────────────────────────────────────────────────

export async function getAllMedia(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/media/get-all?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) throw new Error(`Failed to fetch media`);
  return await response.json();
}

export async function getMediaCategories() {
  const response = await cmsFetch(`${CMS_BASE_URL}/media/categories/get-all`);
  if (!response.ok) throw new Error('Failed to fetch media categories');
  return response.json();
}

// Specific Media Details
export async function getJournalById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/media/journals/get/${id}`);
  return response.ok ? response.json() : null;
}

export async function getArticleById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/media/articles/get/${id}`);
  return response.ok ? response.json() : null;
}

export async function getVideoById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/media/videos/get/${id}`);
  return response.ok ? response.json() : null;
}

export async function getMonografById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/media/monografs/get/${id}`);
  return response.ok ? response.json() : null;
}

export async function getBuletinById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/media/buletins/get/${id}`);
  return response.ok ? response.json() : null;
}

// Media Management routes map
const MEDIA_ROUTE_MAP: Record<string, string> = {
  'video': 'videos',
  'article': 'articles',
  'journal': 'journals',
  'monograf': 'monografs',
  'buletin': 'buletins'
};

export async function addMedia(type: string, formData: FormData) {
  const routePrefix = MEDIA_ROUTE_MAP[type] || `${type}s`;
  const response = await cmsFetch(`${CMS_BASE_URL}/media/${routePrefix}/add`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error(`Failed to add ${type}`);
  return response.json();
}

export async function editMedia(type: string, id: number, formData: FormData) {
  const routePrefix = MEDIA_ROUTE_MAP[type] || `${type}s`;
  const response = await cmsFetch(`${CMS_BASE_URL}/media/${routePrefix}/edit/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) throw new Error(`Failed to edit ${type}`);
  return response.json();
}

export async function deleteMedia(type: string, id: number) {
  const routePrefix = MEDIA_ROUTE_MAP[type] || `${type}s`;
  const response = await cmsFetch(`${CMS_BASE_URL}/media/${routePrefix}/delete/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`Failed to delete ${type}`);
}

// ─── Academics ────────────────────────────────────────────────────────────────

export async function getAllAcademicPrograms(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/get-all-academic-programs?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) throw new Error('Failed to fetch academic programs');
  return response.json();
}

export async function getAcademicProgramById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/get-academic-program/${id}`);
  return response.ok ? response.json() : null;
}

export async function addAcademicProgram(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/add-academic-program`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add academic program');
  return response.json();
}

export async function editAcademicProgram(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/edit-academic-program`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to edit academic program');
  return response.json();
}

export async function deleteAcademicProgram(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/delete-academic-program/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete academic program');
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function getAllAdministrators(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/administrators/get-all-administrators?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) throw new Error('Failed to fetch administrators');
  return response.json();
}

export async function getAllLecturers(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/lecturers/get-all-lecturers?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) throw new Error('Failed to fetch lecturers');
  return response.json();
}

export async function getAdministratorById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/administrators/get-administrator/${id}`);
  return response.ok ? response.json() : null;
}

export async function getLecturerById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/lecturers/get-lecturer/${id}`);
  return response.ok ? response.json() : null;
}

// Profile Management
export async function addAdministrator(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/administrators/add-administrator`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add administrator');
  return response.json();
}

export async function editAdministrator(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/administrators/edit-administrator`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to edit administrator');
  return response.json();
}

export async function deleteAdministrator(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/administrators/delete-administrator/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete administrator');
}

export async function addLecturer(formData: FormData) {
  const response = await cmsFetch(`${CMS_BASE_URL}/lecturers/add-lecturer`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to add lecturer');
  return response.json();
}

export async function editLecturer(formData: FormData) {
  const response = await cmsFetch(`${CMS_BASE_URL}/lecturers/edit-lecturer`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to edit lecturer');
  return response.json();
}

export async function deleteLecturer(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/lecturers/delete-lecturer/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete lecturer');
}

// ─── Admission Costs ──────────────────────────────────────────────────────────

export async function getAllCosts(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/get-all-costs?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) throw new Error('Failed to fetch admission costs');
  return response.json();
}

export async function getCostById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/get-cost/${id}`);
  return response.ok ? response.json() : null;
}

export async function addCost(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/add-cost`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add cost');
  return response.json();
}

export async function editCost(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/edit-cost`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to edit cost');
  return response.json();
}

export async function deleteCost(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/delete-cost/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete cost');
}

export async function getAllCostCategories() {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/get-all-categories`);
  if (!response.ok) throw new Error('Failed to fetch cost categories');
  const data = await response.json();
  return data.items || data;
}

// ─── Admission Deadlines ───────────────────────────────────────────────────────

export async function getAllAdmissionDeadlines(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/admission-deadlines/get-all-batch-deadlines?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) throw new Error('Failed to fetch admission deadlines');
  return response.json();
}

export async function getAdmissionDeadlineById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/admission-deadlines/get-batch-deadline/${id}`);
  return response.ok ? response.json() : null;
}

export async function editAdmissionDeadline(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/admission-deadlines/edit-batch-deadline`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to edit admission deadline');
  return response.json();
}

export async function deleteAdmissionDeadline(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/admission-deadlines/delete-batch-deadline/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete admission deadline');
}

// ─── Auth / User Registration ───────────────────────────────────────────────

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
  if (!response.ok) throw new Error('Failed to register user');
  return response.json();
}

export async function getAllUsers(page = 1, pageSize = 100, search = '') {
  const query = new URLSearchParams({
    PageNumber: page.toString(),
    PageSize: pageSize.toString(),
  });
  if (search) query.append('UserName', search);

  const response = await cmsFetch(`${CMS_BASE_URL}/users/get-all-users?${query.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export async function getUserById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/users/get-user/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

export async function updateUser(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/users/edit-user`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update user');
  return response.json();
}

export async function deleteUser(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/users/delete-user/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete user');
  // Return early for 204 No Content
  if (response.status === 204) return;
  return response.json().catch(() => ({}));
}

// ─── Roles ───────────────────────────────────────────────────────────────────

export async function getAllRoles(page = 1, pageSize = 100, search = '') {
  const query = new URLSearchParams({
    PageNumber: page.toString(),
    PageSize: pageSize.toString(),
  });
  if (search) query.append('RoleName', search);

  const response = await cmsFetch(`${CMS_BASE_URL}/users/get-all-roles?${query.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch roles');
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

export async function updateRole(id: number, name: string, permissions: string[]) {
  const rolePermissionsDTOs = permissions.map(p => ({ PermissionName: p }));
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
  if (!response.ok) throw new Error('Failed to delete role');
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export async function getAllPermissions(page = 1, pageSize = 100, search = '') {
  const query = new URLSearchParams({
    PageNumber: page.toString(),
    PageSize: pageSize.toString(),
  });
  if (search) query.append('PermissionName', search);

  const response = await cmsFetch(`${CMS_BASE_URL}/users/get-all-permissions?${query.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch permissions');
  return response.json();
}

export async function addPermission(name: string) {
  const response = await cmsFetch(`${CMS_BASE_URL}/users/add-permission`, {
    method: 'POST',
    body: JSON.stringify({ PermissionName: name }),
  });
  if (!response.ok) throw new Error('Failed to add permission');
  return response.json();
}

export async function deletePermission(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/users/delete-permission/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete permission');
}


