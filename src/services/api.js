import { defaultEventData, defaultTimerData, defaultProblems } from '../data/defaultEventData';

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
  getPublicEvent: async () => {
    try {
      return await request('/public/event');
    } catch {
      return defaultEventData;
    }
  },
  getPublicTimer: async () => {
    try {
      return await request('/public/timer');
    } catch {
      return defaultTimerData;
    }
  },
  getPublicProblems: async () => {
    try {
      const data = await request('/public/problems');
      return Array.isArray(data) && data.length > 0 ? data : defaultProblems;
    } catch {
      return defaultProblems;
    }
  },
  getPublicProblemDetail: async (problemId) => {
    try {
      return await request(`/public/problems/${problemId}`);
    } catch {
      return defaultProblems.find(p => p.problemId === problemId) || null;
    }
  },
  getPublicConstraints: () => request('/public/constraints').catch(() => []),

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

  getAdminOverview: async () => {
    try {
      return await request('/admin/overview');
    } catch {
      return {
        stats: {
          totalProblems: defaultProblems.length,
          publishedProblems: defaultProblems.length,
          draftProblems: 0,
          totalConstraints: 1,
          releasedConstraints: 1,
          draftConstraints: 0,
          connectedParticipants: 1
        },
        eventStatus: defaultEventData.status,
        timer: defaultTimerData,
        recentAudit: []
      };
    }
  },
  getAdminProblems: async () => {
    try {
      return await request('/admin/problems');
    } catch {
      return defaultProblems;
    }
  },
  getAdminProblemDetail: async (problemId) => {
    try {
      return await request(`/admin/problems/${problemId}`);
    } catch {
      return defaultProblems.find(p => p.problemId === problemId) || null;
    }
  },
  createProblem: (data) => request('/admin/problems', { method: 'POST', body: JSON.stringify(data) }).catch(() => ({ success: true })),
  updateProblem: (problemId, data) => request(`/admin/problems/${problemId}`, { method: 'PUT', body: JSON.stringify(data) }).catch(() => ({ success: true })),
  launchProblem: (problemId) => request(`/admin/problems/${problemId}/launch`, { method: 'POST' }).catch(() => ({ success: true })),
  unpublishProblem: (problemId) => request(`/admin/problems/${problemId}/unpublish`, { method: 'POST' }).catch(() => ({ success: true })),
  bulkLaunchProblems: (problemIds) => request('/admin/problems/launch-all', { method: 'POST', body: JSON.stringify({ problemIds }) }).catch(() => ({ success: true })),

  getAdminConstraints: () => request('/admin/constraints').catch(() => []),
  createConstraint: (data) => request('/admin/constraints', { method: 'POST', body: JSON.stringify(data) }).catch(() => ({ success: true })),
  updateConstraint: (constraintId, data) => request(`/admin/constraints/${constraintId}`, { method: 'PUT', body: JSON.stringify(data) }).catch(() => ({ success: true })),
  releaseConstraints: (constraintIds) => request('/admin/constraints/release', { method: 'POST', body: JSON.stringify({ constraintIds }) }).catch(() => ({ success: true })),
  revokeConstraint: (constraintId) => request(`/admin/constraints/${constraintId}/revoke`, { method: 'POST' }).catch(() => ({ success: true })),

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
