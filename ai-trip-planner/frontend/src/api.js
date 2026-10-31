// Central API client: attaches the JWT session token and handles 401s.
const TOKEN_KEY = 'tripbuddy_token';
const USER_KEY = 'tripbuddy_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setSession(token, username) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify({ username }));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Fetch wrapper.
 * - Adds Authorization header when a token exists.
 * - Parses JSON bodies automatically.
 * - On 401, clears the session and dispatches a global "auth:unauthorized" event.
 * Returns the parsed data on success; throws an Error with a server-provided
 * message (detail) on failure.
 */
export async function apiFetch(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    const err = new Error('Connection error. Please try again.');
    err.cause = e;
    err.isNetwork = true;
    throw err;
  }

  if (res.status === 401 && token) {
    // Existing session is no longer valid -> kick the user to the login screen.
    // (Only when we actually had a token: a 401 on the login form itself is just
    // a wrong password and must surface the server's detail message instead.)
    clearSession();
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    const err = new Error('Your session has expired. Please log in again.');
    err.status = 401;
    throw err;
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    const err = new Error(data?.detail || `Request failed (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  login: (username, password) =>
    apiFetch('/api/auth/login', { method: 'POST', body: { username, password } }),
  me: () => apiFetch('/api/auth/me'),
  planTrip: (params) => apiFetch('/api/plan-trip', { method: 'POST', body: params }),
  feedback: (payload) => apiFetch('/api/feedback', { method: 'POST', body: payload }),
  geocodeHotel: (payload) => apiFetch('/api/geocode-hotel', { method: 'POST', body: payload }),
  userProfile: () => apiFetch('/api/user-profile'),
  compareOptimizers: (payload) => apiFetch('/api/compare-optimizers', { method: 'POST', body: payload }),
};
