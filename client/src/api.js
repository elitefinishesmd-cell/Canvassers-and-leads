const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (res.status === 401 && path !== '/auth/me') {
    // Session expired — redirect to login
    window.location.href = '/';
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (name, pin) => request('/auth/login', { method: 'POST', body: { name, pin } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  usersList: () => request('/auth/users-list'),

  // Leads
  createLead: (lead) => request('/leads', { method: 'POST', body: lead }),
  getLeads: (params = '') => request(`/leads${params ? '?' + params : ''}`),
  getMyLeads: () => request('/leads/mine'),
  getLead: (id) => request(`/leads/${id}`),
  updateLeadStatus: (id, status, notes) => request(`/leads/${id}/status`, { method: 'PATCH', body: { status, notes } }),
  updateLead: (id, data) => request(`/leads/${id}`, { method: 'PATCH', body: data }),
  getServices: () => request('/leads/services'),

  // Appointments
  createAppointment: (data) => request('/appointments', { method: 'POST', body: data }),
  getAppointments: (params = '') => request(`/appointments${params ? '?' + params : ''}`),
  completeAppointment: (id, data) => request(`/appointments/${id}/complete`, { method: 'PATCH', body: data }),

  // Stats
  getDashboard: () => request('/stats/dashboard'),
  getNewLeadCount: () => request('/stats/new-lead-count'),

  // Users
  getUsers: () => request('/users'),
  getEstimators: () => request('/users/estimators'),
  createUser: (data) => request('/users', { method: 'POST', body: data }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PATCH', body: data }),
};
