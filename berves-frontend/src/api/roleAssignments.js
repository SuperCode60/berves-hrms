import axios from '../lib/axios';

export const roleAssignmentsApi = {
  // Get all users with their roles
  getUsersWithRoles: (params = {}) => {
    return axios.get('/api/v1/settings/role-assignments/users', { params });
  },

  // Get user's roles and permissions
  getUserRoles: (userId) => {
    return axios.get(`/api/v1/settings/role-assignments/users/${userId}`);
  },

  // Get user's permissions summary
  getUserPermissions: (userId) => {
    return axios.get(`/api/v1/settings/role-assignments/users/${userId}/permissions`);
  },

  // Assign multiple roles to user
  assignRoles: (userId, roleIds) => {
    return axios.post(`/api/v1/settings/role-assignments/users/${userId}/roles`, { role_ids: roleIds });
  },

  // Assign single role to user
  assignRole: (userId, roleId) => {
    return axios.post(`/api/v1/settings/role-assignments/users/${userId}/role`, { role_id: roleId });
  },

  // Remove role from user
  removeRole: (userId, roleId) => {
    return axios.delete(`/api/v1/settings/role-assignments/users/${userId}/roles/${roleId}`);
  },

  // Get role statistics
  getStats: () => {
    return axios.get('/api/v1/settings/role-assignments/stats');
  },

  // Bulk assign roles to multiple users
  bulkAssign: (data) => {
    return axios.post('/api/v1/settings/role-assignments/bulk-assign', data);
  },

  // Bulk remove roles from multiple users
  bulkRemove: (data) => {
    return axios.post('/api/v1/settings/role-assignments/bulk-remove', data);
  },
};
