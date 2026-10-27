export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function getToken() {
  const raw = localStorage.getItem('token-user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function setToken(token) {
  localStorage.setItem('token-user', token);
}

export function clearToken() {
  localStorage.removeItem('token-user');
}

export function isTokenExpired() {
  const token = getToken();
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return !payload.exp || payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function getRolFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.rol || '').toUpperCase();
  } catch {
    return null;
  }
}

export function getUsuarioIdFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(message, fieldErrors, status) {
    super(message);
    this.name = 'ApiError';
    this.fieldErrors = fieldErrors || {};
    this.status = status;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `Error ${response.status}`;
    let fieldErrors = {};
    try {
      const data = await response.json();
      message = data.error || data.message || message;
      fieldErrors = data.fieldErrors || {};
    } catch {
      message = (await response.text()) || message;
    }
    throw new ApiError(message, fieldErrors, response.status);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
