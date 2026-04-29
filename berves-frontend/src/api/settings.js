import api from '../lib/axios';

export const settingsApi = {
  // General settings
  all:                  ()             => api.get('/settings'),
  update:               (key, val)     => api.put(`/settings/${key}`, { value: val }),
  reset:                ()             => api.post('/settings/reset'),

  // Payroll cycle
  payrollCycle:         ()             => api.get('/settings/payroll-cycle'),
  updatePayrollCycle:   (data)         => api.put('/settings/payroll-cycle', data),

  // Tax
  taxConfigurations:    ()             => api.get('/settings/tax-configurations'),
  updateTax:            (data)         => api.put('/settings/tax-configurations', data),
  activateTax:          (id)           => api.post(`/settings/tax-configurations/${id}/activate`),

  // Overtime policies
  overtimePolicies:     ()             => api.get('/settings/overtime-policies'),
  createOvertimePolicy: (data)         => api.post('/settings/overtime-policies', data),
  updateOvertimePolicy: (id, data)     => api.put(`/settings/overtime-policies/${id}`, data),
  deleteOvertimePolicy: (id)           => api.delete(`/settings/overtime-policies/${id}`),
  activateOtPolicy:     (id)           => api.post(`/settings/overtime-policies/${id}/activate`),
  deactivateOtPolicy:   (id)           => api.post(`/settings/overtime-policies/${id}/deactivate`),

  // Leave policies
  leavePolicies:        ()             => api.get('/settings/leave-policies'),
  createLeavePolicy:    (data)         => api.post('/settings/leave-policies', data),
  updateLeavePolicy:    (id, data)     => api.put(`/settings/leave-policies/${id}`, data),
  deleteLeavePolicy:    (id)           => api.delete(`/settings/leave-policies/${id}`),
  activateLeavePolicy:  (id)           => api.post(`/settings/leave-policies/${id}/activate`),

  // Notifications settings
  notificationSettings: ()             => api.get('/settings/notifications'),
  updateNotifications:  (data)         => api.put('/settings/notifications', data),
  testNotification:     (data)         => api.post('/settings/notifications/test', data),

  // Roles & permissions
  roles:                ()             => api.get('/settings/roles'),
  createRole:           (data)         => api.post('/settings/roles', data),
  updateRolePermissions:(roleId, perms)=> api.put(`/settings/roles/${roleId}/permissions`, { permissions: perms }),
  deleteRole:           (roleId)       => api.delete(`/settings/roles/${roleId}`),

  // Sites
  sites:                ()             => api.get('/sites'),
  createSite:           (data)         => api.post('/sites', data),
  updateSite:           (id, data)     => api.put(`/sites/${id}`, data),
  activateSite:         (id)           => api.post(`/sites/${id}/activate`),
  deactivateSite:       (id)           => api.post(`/sites/${id}/deactivate`),

  // Backup & Restore
  backups:              ()             => api.get('/settings/backups'),
  createBackup:         (type)         => api.post('/settings/backups', { type: type || 'manual' }),
  downloadBackup:       (filename)     => api.get(`/settings/backups/${encodeURIComponent(filename)}/download`, { responseType: 'blob' }),
  restoreBackup:        (formData)     => api.post('/settings/backups/restore', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }),
  deleteBackup:         (filename)     => api.delete(`/settings/backups/${encodeURIComponent(filename)}`),

  // System health
  systemHealth:         ()             => api.get('/settings/backups/system-health'),
  clearCache:           ()             => api.post('/settings/backups/clear-cache'),
};
