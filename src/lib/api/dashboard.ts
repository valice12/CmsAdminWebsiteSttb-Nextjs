import { cmsFetch, CMS_BASE_URL } from './base';

export async function getDashboardData() {
  const response = await cmsFetch(`${CMS_BASE_URL}/dashboards`);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return response.json();
}
