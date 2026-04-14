import { cmsFetch, CMS_BASE_URL } from './base';

export async function getAllMedia(page = 1, pageSize = 100, search = '') {
  const query = new URLSearchParams({
    PageNumber: page.toString(),
    PageSize: pageSize.toString(),
  });
  if (search) {
    query.append('MediaName', search);
  }
  const response = await cmsFetch(`${CMS_BASE_URL}/media/get-all?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch media`);
  }
  return await response.json();
}

export async function getAllMediaCategories(page = 1, pageSize = 10, fetchAll = false) {
  const response = await cmsFetch(`${CMS_BASE_URL}/media/categories/get-all?PageNumber=${page}&PageSize=${pageSize}&FetchAll=${fetchAll}`);
  if (!response.ok) {
    throw new Error('Failed to fetch media categories');
  }
  return response.json();
}

export async function addMediaCategory(categoryName: string) {
  const response = await cmsFetch(`${CMS_BASE_URL}/media/categories/add`, {
    method: 'POST',
    body: JSON.stringify({ CategoryName: categoryName }),
  });
  if (!response.ok) {
    throw new Error('Failed to add media category');
  }
  return response.json();
}

export async function editMediaCategory(id: number, categoryName: string) {
  const response = await cmsFetch(`${CMS_BASE_URL}/media/categories/edit`, {
    method: 'PUT',
    body: JSON.stringify({ Id: id, CategoryName: categoryName }),
  });
  if (!response.ok) {
    throw new Error('Failed to edit media category');
  }
  return response.json();
}

export async function deleteMediaCategory(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/media/categories/delete/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete media category');
  }
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
  if (!response.ok) {
    throw new Error(`Failed to add ${type}`);
  }
  return response.json();
}

export async function editMedia(type: string, id: number, formData: FormData) {
  const routePrefix = MEDIA_ROUTE_MAP[type] || `${type}s`;
  const response = await cmsFetch(`${CMS_BASE_URL}/media/${routePrefix}/edit/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Failed to edit ${type}`);
  }
  return response.json();
}

export async function deleteMedia(type: string, id: number) {
  const routePrefix = MEDIA_ROUTE_MAP[type] || `${type}s`;
  const response = await cmsFetch(`${CMS_BASE_URL}/media/${routePrefix}/delete/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete ${type}`);
  }
}
