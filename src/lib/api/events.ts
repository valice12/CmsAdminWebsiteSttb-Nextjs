import { cmsFetch, CMS_BASE_URL } from './base';

export async function getAllEvents(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/get-all-events?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
}

export async function getEventById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/get-event/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch event detail');
  }
  return response.json();
}

export async function getAllEventCategories(page = 1, pageSize = 10, fetchAll = false) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/get-all-categories?PageNumber=${page}&PageSize=${pageSize}&FetchAll=${fetchAll}`);
  if (!response.ok) {
    throw new Error('Failed to fetch event categories');
  }
  return response.json();
}

export async function addEventCategory(categoryName: string) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/add-category`, {
    method: 'POST',
    body: JSON.stringify({ CategoryName: categoryName, Slug: categoryName }),
  });
  if (!response.ok) {
    throw new Error('Failed to add event category');
  }
  return response.json();
}

export async function editEventCategory(id: number, categoryName: string) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/edit-category`, {
    method: 'PUT',
    body: JSON.stringify({ Id: id, CategoryName: categoryName, Slug: categoryName }),
  });
  if (!response.ok) {
    throw new Error('Failed to edit event category');
  }
  return response.json();
}

export async function deleteEventCategory(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/delete-category/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete event category');
  }
}

export async function addEvent(formData: FormData) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/add-event`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to add event');
  }
  return response.json();
}

export async function editEvent(formData: FormData) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/edit-event`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to edit event');
  }
  return response.json();
}

export async function deleteEvent(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/events/delete-event/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete event');
  }
}
