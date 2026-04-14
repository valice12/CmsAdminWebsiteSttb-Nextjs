import { cmsFetch, CMS_BASE_URL } from './base';

export async function getAllAdministrators(page = 1, pageSize = 100, search = '') {
  const query = new URLSearchParams({
    PageNumber: page.toString(),
    PageSize: pageSize.toString(),
  });
  if (search) {
    query.append('AdministratorName', search);
  }
  const response = await cmsFetch(`${CMS_BASE_URL}/administrators/get-all-administrators?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch administrators');
  }
  return response.json();
}

export async function getAllLecturers(page = 1, pageSize = 100, search = '') {
  const query = new URLSearchParams({
    PageNumber: page.toString(),
    PageSize: pageSize.toString(),
  });
  if (search) {
    query.append('LecturerName', search);
  }
  const response = await cmsFetch(`${CMS_BASE_URL}/lecturers/get-all-lecturers?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch lecturers');
  }
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
  if (!response.ok) {
    throw new Error('Failed to add administrator');
  }
  return response.json();
}

export async function editAdministrator(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/administrators/edit-administrator`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to edit administrator');
  }
  return response.json();
}

export async function deleteAdministrator(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/administrators/delete-administrator/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete administrator');
  }
}

export async function addLecturer(formData: FormData) {
  const response = await cmsFetch(`${CMS_BASE_URL}/lecturers/add-lecturer`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to add lecturer');
  }
  return response.json();
}

export async function editLecturer(formData: FormData) {
  const response = await cmsFetch(`${CMS_BASE_URL}/lecturers/edit-lecturer`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to edit lecturer');
  }
  return response.json();
}

export async function deleteLecturer(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/lecturers/delete-lecturer/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete lecturer');
  }
}
