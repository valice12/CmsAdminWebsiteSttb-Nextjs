import { cmsFetch, CMS_BASE_URL } from './base';

export async function getAllAcademicPrograms(page = 1, pageSize = 100, search = '') {
  const query = new URLSearchParams({
    PageNumber: page.toString(),
    PageSize: pageSize.toString(),
  });
  if (search) {
    query.append('AcademicProgramName', search);
  }
  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/get-all-academic-programs?${query.toString()}`);
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

export async function getAllCourses(page = 1, pageSize = 10, search = '', fetchAll = false) {
  const query = new URLSearchParams();

  if (fetchAll) {
    query.append('FetchAll', 'true');
  } else {
    query.append('FetchAll', 'false');
    query.append('PageNumber', page.toString());
    query.append('PageSize', pageSize.toString());
  }

  if (search) {
    query.append('CourseName', search);
  }

  const response = await cmsFetch(`${CMS_BASE_URL}/academic-programs/get-all-courses?${query.toString()}`);
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
