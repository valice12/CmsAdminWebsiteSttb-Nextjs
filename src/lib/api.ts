const BASE_URL = 'http://localhost:5066/api/v1';
const CMS_BASE_URL = `${BASE_URL}/cms`;

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

// News
export async function getAllNews(page = 1, pageSize = 10) {
  const response = await fetch(`${CMS_BASE_URL}/news/get-all-news?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) throw new Error('Failed to fetch news');
  return response.json();
}

export async function getNewsById(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/news/get-news/${id}`);
  if (!response.ok) throw new Error('Failed to fetch news detail');
  return response.json();
}

export async function getAllNewsCategories() {
  const response = await fetch(`${CMS_BASE_URL}/news/get-all-categories`);
  if (!response.ok) throw new Error('Failed to fetch news categories');
  return response.json();
}

export async function addNews(formData: FormData) {
  const response = await fetch(`${CMS_BASE_URL}/news/add-news`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to add news');
  return response.json();
}

export async function editNews(formData: FormData) {
  const response = await fetch(`${CMS_BASE_URL}/news/edit-news`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to edit news');
  return response.json();
}

export async function deleteNews(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/news/delete-news/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete news');
}

// Events
export async function getAllEvents(page = 1, pageSize = 10) {
  const response = await fetch(`${CMS_BASE_URL}/events/get-all-events?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

export async function getEventById(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/events/get-event/${id}`);
  if (!response.ok) throw new Error('Failed to fetch event detail');
  return response.json();
}

export async function getAllEventCategories() {
  const response = await fetch(`${CMS_BASE_URL}/events/get-all-categories`);
  if (!response.ok) throw new Error('Failed to fetch event categories');
  return response.json();
}

export async function addEvent(formData: FormData) {
  const response = await fetch(`${CMS_BASE_URL}/events/add-event`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to add event');
  return response.json();
}

export async function editEvent(formData: FormData) {
  const response = await fetch(`${CMS_BASE_URL}/events/edit-event`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to edit event');
  return response.json();
}

export async function deleteEvent(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/events/delete-event/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete event');
}

// Media
export async function getAllMedia(format: string, page = 1, pageSize = 10) {
  const response = await fetch(`${CMS_BASE_URL}/media/get-all?MediaFormat=${format}&PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) throw new Error(`Failed to fetch media`);
  return response.json();
}

// Specific Media Details
export async function getJournalById(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/media/journals/get/${id}`);
  return response.ok ? response.json() : null;
}

export async function getArticleById(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/media/articles/get/${id}`);
  return response.ok ? response.json() : null;
}

export async function getVideoById(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/media/videos/get/${id}`);
  return response.ok ? response.json() : null;
}

export async function getMonografById(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/media/monografs/get/${id}`);
  return response.ok ? response.json() : null;
}

// Media Management routes map
const MEDIA_ROUTE_MAP: Record<string, string> = {
  'video': 'videos',
  'artikel': 'articles',
  'journal': 'journals',
  'monograf': 'monografs',
  'buletin': 'buletins'
};

export async function addMedia(type: string, formData: FormData) {
  const routePrefix = MEDIA_ROUTE_MAP[type] || `${type}s`;
  const response = await fetch(`${CMS_BASE_URL}/media/${routePrefix}/add`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error(`Failed to add ${type}`);
  return response.json();
}

export async function editMedia(type: string, id: number, formData: FormData) {
  const routePrefix = MEDIA_ROUTE_MAP[type] || `${type}s`;
  const response = await fetch(`${CMS_BASE_URL}/media/${routePrefix}/edit/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) throw new Error(`Failed to edit ${type}`);
  return response.json();
}

export async function deleteMedia(type: string, id: number) {
  const routePrefix = MEDIA_ROUTE_MAP[type] || `${type}s`;
  const response = await fetch(`${CMS_BASE_URL}/media/${routePrefix}/delete/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`Failed to delete ${type}`);
}

// Academics
export async function getAllAcademicPrograms() {
  const response = await fetch(`${CMS_BASE_URL}/academic-programs/get-all-academic-programs`);
  if (!response.ok) throw new Error('Failed to fetch academic programs');
  return response.json();
}

export async function getAcademicProgramById(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/academic-programs/get-academic-program/${id}`);
  return response.ok ? response.json() : null;
}

export async function addAcademicProgram(data: any) {
  const response = await fetch(`${CMS_BASE_URL}/academic-programs/add-academic-program`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add academic program');
  return response.json();
}

export async function editAcademicProgram(data: any) {
  const response = await fetch(`${CMS_BASE_URL}/academic-programs/edit-academic-program`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to edit academic program');
  return response.json();
}

export async function deleteAcademicProgram(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/academic-programs/delete-academic-program/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete academic program');
}

// Profiles
export async function getAllAdministrators() {
  const response = await fetch(`${CMS_BASE_URL}/administrators/get-all-administrators`);
  if (!response.ok) throw new Error('Failed to fetch administrators');
  return response.json();
}

export async function getAllLecturers() {
  const response = await fetch(`${CMS_BASE_URL}/lecturers/get-all-lecturers`);
  if (!response.ok) throw new Error('Failed to fetch lecturers');
  return response.json();
}

export async function getAdministratorById(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/administrators/get-administrator/${id}`);
  return response.ok ? response.json() : null;
}

export async function getLecturerById(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/lecturers/get-lecturer/${id}`);
  return response.ok ? response.json() : null;
}

// Profile Management
export async function addAdministrator(data: any) {
  const response = await fetch(`${CMS_BASE_URL}/administrators/add-administrator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add administrator');
  return response.json();
}

export async function editAdministrator(data: any) {
  const response = await fetch(`${CMS_BASE_URL}/administrators/edit-administrator`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to edit administrator');
  return response.json();
}

export async function deleteAdministrator(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/administrators/delete-administrator/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete administrator');
}

export async function addLecturer(formData: FormData) {
  const response = await fetch(`${CMS_BASE_URL}/lecturers/add-lecturer`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to add lecturer');
  return response.json();
}

export async function editLecturer(formData: FormData) {
  const response = await fetch(`${CMS_BASE_URL}/lecturers/edit-lecturer`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to edit lecturer');
  return response.json();
}

export async function deleteLecturer(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/lecturers/delete-lecturer/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete lecturer');
}

// Admission Costs
export async function getAllCosts() {
  const response = await fetch(`${CMS_BASE_URL}/costs/get-all-costs`);
  if (!response.ok) throw new Error('Failed to fetch admission costs');
  return response.json();
}

export async function getCostById(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/costs/get-cost/${id}`);
  return response.ok ? response.json() : null;
}

export async function addCost(data: any) {
  const response = await fetch(`${CMS_BASE_URL}/costs/add-cost`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add cost');
  return response.json();
}

export async function editCost(data: any) {
  const response = await fetch(`${CMS_BASE_URL}/costs/edit-cost`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to edit cost');
  return response.json();
}

export async function deleteCost(id: number) {
  const response = await fetch(`${CMS_BASE_URL}/costs/delete-cost/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete cost');
}
