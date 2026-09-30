const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Convert body to JSON string if it's an object and Content-Type is json
  if (
    config.body && 
    typeof config.body === 'object' && 
    headers['Content-Type'] === 'application/json'
  ) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    // Try to parse JSON response
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    }

    if (!response.ok) {
      // If token is invalid or expired, clear it and trigger event
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
      
      throw new ApiError(
        data?.message || data?.error || response.statusText || 'An unexpected error occurred',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle network errors or JSON parse errors
    throw new ApiError(error.message || 'Network Error', 0, null);
  }
}

export const api = {
  get: (endpoint, headers) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) => request(endpoint, { method: 'POST', body, headers }),
  put: (endpoint, body, headers) => request(endpoint, { method: 'PUT', body, headers }),
  delete: (endpoint, headers) => request(endpoint, { method: 'DELETE', headers }),
};
