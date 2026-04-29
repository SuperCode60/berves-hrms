import api from '../lib/axios';
export const trainingApi = {
  programs:        (params) => api.get('/training/programs', { params }),
  createProgram:   (data)   => api.post('/training/programs', data),
  enrollments:     (params) => api.get('/training/enrollments', { params }),
  enroll:          (data)   => api.post('/training/enrollments', data),
  updateEnrollment:(id, data) => api.put(`/training/enrollments/${id}`, data),
  expiringCerts:   ()       => api.get('/training/enrollments/expiring'),
};
