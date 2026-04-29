import api from '../lib/axios';
export const performanceApi = {
  kpis:            ()       => api.get('/performance/kpis'),
  createKpi:       (data)   => api.post('/performance/kpis', data),
  cycles:          ()       => api.get('/performance/cycles'),
  createCycle:     (data)   => api.post('/performance/cycles', data),
  appraisals:      (params) => api.get('/performance/appraisals', { params }),
  getAppraisal:    (id)     => api.get(`/performance/appraisals/${id}`),
  createAppraisal: (data)   => api.post('/performance/appraisals', data),
  submitAppraisal: (id)     => api.post(`/performance/appraisals/${id}/submit`),
  updateKpiScore:  (appraisalId, kpiId, data) => api.put(`/performance/appraisals/${appraisalId}/kpis/${kpiId}`, data),
};
