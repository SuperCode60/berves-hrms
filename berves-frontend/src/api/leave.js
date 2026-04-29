import api from '../lib/axios';
export const leaveApi = {
  types:          ()       => api.get('/leave/types'),
  requests:       (params) => api.get('/leave/requests', { params }),
  createRequest:  (data)   => api.post('/leave/requests', data),
  approveRequest: (id, data) => api.post(`/leave/requests/${id}/review`, data),
  cancelRequest:  (id)     => api.post(`/leave/requests/${id}/cancel`),
  entitlements:   (params) => api.get('/leave/entitlements', { params }),
  offDayRequests:      (params) => api.get('/leave/off-days', { params }),
  createOffDay:        (data)   => api.post('/leave/off-days', data),
  approveOffDay:       (id, data) => api.post(`/leave/off-days/${id}/review`, data),
  approveOffDayDirect: (id)    => api.post(`/leave/off-days/${id}/approve`),
  rejectOffDayDirect:  (id)    => api.post(`/leave/off-days/${id}/reject`),
  cancelOffDay:        (id)    => api.delete(`/leave/off-days/${id}`),
  holidays:       (params) => api.get('/leave/holidays', { params }),
};
