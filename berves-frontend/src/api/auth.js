import api from '../lib/axios';
export const authApi = {
  // PHP built-in server / some proxies can drop JSON bodies; form-encoding is more reliable here.
  login:          ({ email, password }) =>
    api.post(
      '/auth/login',
      new URLSearchParams({ email, password }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ),
  logout:         ()     => api.post('/auth/logout'),
  me:             ()     => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};
