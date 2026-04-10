import { cmsFetch, CMS_BASE_URL } from './base';

export async function getAllAcademicPrograms(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/get-all-academic-programs?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) {
    throw new Error('Failed to fetch academic programs');
  }
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
  if (!response.ok) {
    throw new Error('Failed to add academic program');
  }
  return response.json();
}

export async function editAcademicProgram(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/edit-academic-program`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to edit academic program');
  }
  return response.json();
}

export async function deleteAcademicProgram(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/delete-academic-program/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete academic program');
  }
}

// ─── Academic Courses ──────────────────────────────────────────────────────────

export async function getAllCourses(page?: number, pageSize?: number, fetchAll = false) {
  let url = `${CMS_BASE_URL}/academic-programs/get-all-courses?FetchAll=${fetchAll}`;

  if (!fetchAll) {
    const p = page || 1;
    const ps = pageSize || 10;
    url += `&PageNumber=${p}&PageSize=${ps}`;
  }

  const response = await cmsFetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }
  return response.json();
}

export async function getCourseById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/get-course/${id}`);
  return response.ok ? response.json() : null;
}

export async function addCourse(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/add-course`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to add course');
  }
  return response.json();
}

export async function editCourse(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/edit-course`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to edit course');
  }
  return response.json();
}

export async function deleteCourse(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/delete-course/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete course');
  }
}
