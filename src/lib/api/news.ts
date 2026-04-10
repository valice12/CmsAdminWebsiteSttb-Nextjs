import { cmsFetch, CMS_BASE_URL } from './base';

export async function getAllNews(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/get-all-news?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
}

export async function getNewsById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/get-news/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch news detail');
  }
  return response.json();
}

export async function getAllNewsCategories(page = 1, pageSize = 10, fetchAll = false) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/get-all-categories?PageNumber=${page}&PageSize=${pageSize}&FetchAll=${fetchAll}`);
  if (!response.ok) {
    throw new Error('Failed to fetch news categories');
  }
  return response.json();
}

export async function addNewsCategory(categoryName: string) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/add-category`, {
    method: 'POST',
    body: JSON.stringify({ CategoryName: categoryName }),
  });
  if (!response.ok) {
    throw new Error('Failed to add news category');
  }
  return response.json();
}

export async function editNewsCategory(id: number, categoryName: string) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/edit-category`, {
    method: 'PUT',
    body: JSON.stringify({ Id: id, CategoryName: categoryName }),
  });
  if (!response.ok) {
    throw new Error('Failed to edit news category');
  }
  return response.json();
}

export async function deleteNewsCategory(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/delete-category/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete news category');
  }
}

export async function addNews(formData: FormData) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/add-news`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to add news');
  }
  return response.json();
}

export async function editNews(formData: FormData) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/edit-news`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to edit news');
  }
  return response.json();
}

export async function deleteNews(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/news/delete-news/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete news');
  }
}
