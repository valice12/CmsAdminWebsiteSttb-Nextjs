import { cmsFetch, CMS_BASE_URL } from './base';

export async function getAllCosts(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/get-all-costs?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) {
    throw new Error('Failed to fetch admission costs');
  }
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
  if (!response.ok) {
    throw new Error('Failed to add cost');
  }
  return response.json();
}

export async function editCost(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/edit-cost`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to edit cost');
  }
  return response.json();
}

export async function deleteCost(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/delete-cost/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete cost');
  }
}

export async function getAllCostCategories(page = 1, pageSize = 10, fetchAll = false) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/categories/get-all?PageNumber=${page}&PageSize=${pageSize}&FetchAll=${fetchAll}`);
  if (!response.ok) {
    throw new Error('Failed to fetch cost categories');
  }
  const data = await response.json();
  return data;
}

export async function getCostCategoryById(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/categories/get/${id}`);
  return response.ok ? response.json() : null;
}

export async function addCostCategory(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/categories/add`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to add cost category');
  }
  return response.json();
}

export async function editCostCategory(data: any) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/categories/edit`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to edit cost category');
  }
  return response.json();
}

export async function deleteCostCategory(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/costs/categories/delete/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete cost category');
  }
}

// ─── Admission Deadlines ───────────────────────────────────────────────────────

export async function getAllAdmissionDeadlines(page = 1, pageSize = 100) {
  const response = await cmsFetch(`${CMS_BASE_URL}/admission-deadlines/get-all-batch-deadlines?PageNumber=${page}&PageSize=${pageSize}`);
  if (!response.ok) {
    throw new Error('Failed to fetch admission deadlines');
  }
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
  if (!response.ok) {
    throw new Error('Failed to edit admission deadline');
  }
  return response.json();
}

export async function deleteAdmissionDeadline(id: number) {
  const response = await cmsFetch(`${CMS_BASE_URL}/admission-deadlines/delete-batch-deadline/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete admission deadline');
  }
}
