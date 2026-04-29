import api from '../lib/axios';
export const safetyApi = {
  incidents:       (params)   => api.get('/safety/incidents', { params }),
  createIncident:  (fd)       => api.post('/safety/incidents', fd, { headers:{ 'Content-Type':'multipart/form-data' } }),
  updateIncident:  (id, data) => api.put(`/safety/incidents/${id}`, data),
  inspections:     (params)   => api.get('/safety/inspections', { params }),
  createInspection:(data)     => api.post('/safety/inspections', data),
  updateInspection:(id, data) => api.put(`/safety/inspections/${id}`, data),
};
