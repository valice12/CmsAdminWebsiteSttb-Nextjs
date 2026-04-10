const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5066/api/v1';
const CMS_BASE_URL = `${BASE_URL}/cms`;

/**
 * Helper: baca token JWT dari localStorage
 */
function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }
  const userJson = localStorage.getItem('cms_current_user');
  if (!userJson) {
    return {};
  }
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
export async function cmsFetch(url: string, options: RequestInit = {}) {
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

/**
 * Fetch with timeout utility
 */
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

export { CMS_BASE_URL };
