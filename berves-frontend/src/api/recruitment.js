import api from '../lib/axios';
export const recruitmentApi = {
  postings:          (params)   => api.get('/recruitment/postings', { params }),
  createPosting:     (data)     => api.post('/recruitment/postings', data),
  updatePosting:     (id, data) => api.put(`/recruitment/postings/${id}`, data),
  applicants:        (postingId, params) => api.get(`/recruitment/postings/${postingId}/applicants`, { params }),
  updateApplicant:   (id, data) => api.put(`/recruitment/applicants/${id}`, data),
  interviews:        (params)   => api.get('/recruitment/interviews', { params }),
  scheduleInterview: (data)     => api.post('/recruitment/interviews', data),
  submitEvaluation:  (id, data) => api.post(`/recruitment/interviews/${id}/evaluate`, data),
  onboarding:        (employeeId) => api.get(`/recruitment/onboarding/${employeeId}`),
  completeTask:      (id, data)   => api.post(`/recruitment/onboarding/${id}/complete`, data),
};
