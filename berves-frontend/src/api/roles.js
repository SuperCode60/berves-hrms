import axios from '../lib/axios';

export const rolesApi = {
  // Get all roles with pagination
  list: (params = {}) => {
    return axios.get('/api/v1/settings/roles', { params });
  },

  // Get all roles without pagination (for dropdowns)
  all: () => {
    return axios.get('/api/v1/settings/roles/all');
  },

  // Get single role
  get: (id) => {
    return axios.get(`/api/v1/settings/roles/${id}`);
  },

  // Create new role
  create: (data) => {
    return axios.post('/api/v1/settings/roles', data);
  },

  // Update role
  update: (id, data) => {
    return axios.put(`/api/v1/settings/roles/${id}`, data);
  },

  // Delete role
  delete: (id) => {
    return axios.delete(`/api/v1/settings/roles/${id}`);
  },

  // Get role permissions
  getPermissions: (id) => {
    return axios.get(`/api/v1/settings/roles/${id}/permissions`);
  },

  // Assign permissions to role
  assignPermissions: (id, permissions) => {
    return axios.post(`/api/v1/settings/roles/${id}/permissions`, { permissions });
  },

  // Get users with this role
  getUsers: (id, params = {}) => {
    return axios.get(`/api/v1/settings/roles/${id}/users`, { params });
  },
};
