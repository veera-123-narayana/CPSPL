/**
 * INNOVRUSH 2K26 — API Client Service
 */

const API_BASE = '/api';

// Admin Token Management (stored in sessionStorage so it clears on browser close)
const TOKEN_KEY = 'innovrush_admin_jwt';

export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function clearAdminToken() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TOKEN_KEY);
}

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getAdminToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Public APIs
  getPublicEvent: () => request('/public/event'),
  getPublicTimer: () => request('/public/timer'),
  getPublicProblems: () => request('/public/problems'),
  getPublicProblemDetail: (problemId) => request(`/public/problems/${problemId}`),
  getPublicConstraints: () => request('/public/constraints'),

  // Admin APIs
  adminLogin: async (email, password) => {
    const res = await request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      setAdminToken(res.token);
    }
    return res;
  },

  getAdminOverview: () => request('/admin/overview'),
  getAdminProblems: () => request('/admin/problems'),
  getAdminProblemDetail: (problemId) => request(`/admin/problems/${problemId}`),
  createProblem: (data) => request('/admin/problems', { method: 'POST', body: JSON.stringify(data) }),
  updateProblem: (problemId, data) => request(`/admin/problems/${problemId}`, { method: 'PUT', body: JSON.stringify(data) }),
  launchProblem: (problemId) => request(`/admin/problems/${problemId}/launch`, { method: 'POST' }),
  unpublishProblem: (problemId) => request(`/admin/problems/${problemId}/unpublish`, { method: 'POST' }),
  bulkLaunchProblems: (problemIds) => request('/admin/problems/launch-all', { method: 'POST', body: JSON.stringify({ problemIds }) }),

  getAdminConstraints: () => request('/admin/constraints'),
  createConstraint: (data) => request('/admin/constraints', { method: 'POST', body: JSON.stringify(data) }),
  updateConstraint: (constraintId, data) => request(`/admin/constraints/${constraintId}`, { method: 'PUT', body: JSON.stringify(data) }),
  releaseConstraints: (constraintIds) => request('/admin/constraints/release', { method: 'POST', body: JSON.stringify({ constraintIds }) }),
  revokeConstraint: (constraintId) => request(`/admin/constraints/${constraintId}/revoke`, { method: 'POST' }),

  startTimer: () => request('/admin/timer/start', { method: 'POST' }),
  pauseTimer: () => request('/admin/timer/pause', { method: 'POST' }),
  resumeTimer: () => request('/admin/timer/resume', { method: 'POST' }),
  resetTimer: (newDurationMinutes) => request('/admin/timer/reset', { method: 'POST', body: JSON.stringify({ newDurationMinutes }) }),
  endTimer: () => request('/admin/timer/end', { method: 'POST' }),
  configTimer: (data) => request('/admin/timer/config', { method: 'POST', body: JSON.stringify(data) }),

  approveTeamSize: (approvedSize, note) => request('/admin/rules/team-size', { method: 'POST', body: JSON.stringify({ approvedSize, note }) }),
  updateEventStatus: (status) => request('/admin/event/status', { method: 'POST', body: JSON.stringify({ status }) }),
  getAuditLog: () => request('/admin/audit-log')
};
