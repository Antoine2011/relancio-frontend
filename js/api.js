// js/api.js — Client API Relancio
// Configure l'URL du backend ici :
const API_BASE = window.RELANCIO_API || 'https://VOTRE-BACKEND.railway.app';

// ── Token management (mémoire uniquement, pas localStorage) ──
let _token = null;
let _tokenExpiry = null;

export function setToken(token, expiresIn) {
  _token = token;
  _tokenExpiry = Date.now() + (expiresIn * 1000);
}

export function getToken() { return _token; }
export function clearToken() { _token = null; _tokenExpiry = null; }
export function isTokenValid() { return _token && _tokenExpiry && Date.now() < _tokenExpiry; }

// ── Base fetch wrapper ──
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `Erreur ${res.status}`);
    err.status = res.status;
    err.code = data.code;
    throw err;
  }

  return data;
}

// ════════════════════════════════════════
// AUTH
// ════════════════════════════════════════
export const auth = {
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  verifyOTP:(body) => apiFetch('/auth/verify-otp',{ method: 'POST', body: JSON.stringify(body) }),
  resendOTP:(body) => apiFetch('/auth/resend-otp',{ method: 'POST', body: JSON.stringify(body) }),
  logout:   ()     => apiFetch('/auth/logout',   { method: 'POST' }),
  me:       ()     => apiFetch('/auth/me'),
};

// ════════════════════════════════════════
// STRIPE
// ════════════════════════════════════════
export const payments = {
  plans:        ()       => apiFetch('/stripe/plans'),
  checkout:     (plan)   => apiFetch('/stripe/checkout',     { method: 'POST', body: JSON.stringify({ plan }) }),
  portal:       ()       => apiFetch('/stripe/portal',       { method: 'POST' }),
  subscription: ()       => apiFetch('/stripe/subscription'),
};

// ════════════════════════════════════════
// DASHBOARD / DATA
// ════════════════════════════════════════
export const api = {
  dashboard:    ()       => apiFetch('/api/dashboard'),
  invoices:     ()       => apiFetch('/api/invoices'),
  createInvoice:(body)   => apiFetch('/api/invoices',         { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id, s)  => apiFetch(`/api/invoices/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: s }) }),
  audit:        ()       => apiFetch('/api/audit'),
  profile:      ()       => apiFetch('/api/profile'),
  updateProfile:(body)   => apiFetch('/api/profile',          { method: 'PATCH', body: JSON.stringify(body) }),
};
