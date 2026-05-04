const TOKEN_KEY = 'token';

const API_BASE_URL = '';

const createUsernameFromEmail = (email) => {
  const localPart = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const hash = Array.from(email).reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) >>> 0;
  }, 0).toString(36);

  return `${localPart || 'user'}_${hash}`;
};

const requestJson = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  return { response, data };
};

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

const notifyAuthChange = () => {
  window.dispatchEvent(new Event('auth-changed'));
};

export const storeToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChange();
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  notifyAuthChange();
};

export const loginWithBackend = async (email, password) => {
  const result = await requestJson(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (!result.response.ok) {
    throw new Error(result.data.message || 'Login failed');
  }

  if (!result.data.token) {
    throw new Error('JWT token missing from server response');
  }

  storeToken(result.data.token);
  return result.data;
};

export const registerWithBackend = async (email, password) => {
  const result = await requestJson(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: createUsernameFromEmail(email),
      email,
      password
    })
  });

  if (!result.response.ok) {
    throw new Error(result.data.message || 'Registration failed');
  }

  if (!result.data.token) {
    throw new Error('JWT token missing from server response');
  }

  storeToken(result.data.token);
  return result.data;
};