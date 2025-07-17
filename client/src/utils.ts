function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function authenticatedFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  }).then(response => {
    if (response.status === 401) {
      // Token expired, clear it
      localStorage.removeItem('authToken');
      // Optionally redirect to login or throw error
      throw new Error('Authentication expired');
    }
    return response;
  });
}
