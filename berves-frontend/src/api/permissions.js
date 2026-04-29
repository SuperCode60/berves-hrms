import axios from '../lib/axios';

export const permissionsApi = {
  // Get all permissions with pagination
  list: (params = {}) => {
    return axios.get('/api/v1/settings/permissions', { params });
  },

  // Get all permissions without pagination (for dropdowns)
  all: () => {
    return axios.get('/api/v1/settings/permissions/all');
  },

  // Get permissions grouped by module
  grouped: () => {
    return axios.get('/api/v1/settings/permissions/grouped');
  },

  // Get available modules
  modules: () => {
    return axios.get('/api/v1/settings/permissions/modules');
  },

  // Get single permission
  get: (id) => {
    return axios.get(`/api/v1/settings/permissions/${id}`);
  },

  // Create new permission
  create: (data) => {
    return axios.post('/api/v1/settings/permissions', data);
  },

  // Update permission
  update: (id, data) => {
    return axios.put(`/api/v1/settings/permissions/${id}`, data);
  },

  // Delete permission
  delete: (id) => {
    return axios.delete(`/api/v1/settings/permissions/${id}`);
  },

  // Bulk create permissions for a module
  bulkCreate: (data) => {
    return axios.post('/api/v1/settings/permissions/bulk-create', data);
  },

  // Get roles that have this permission
  getRoles: (id) => {
    return axios.get(`/api/v1/settings/permissions/${id}/roles`);
  },

  // Get users that have this permission
  getUsers: (id, params = {}) => {
    return axios.get(`/api/v1/settings/permissions/${id}/users`, { params });
  },
};
