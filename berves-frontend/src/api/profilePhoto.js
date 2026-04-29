import axios from '../lib/axios';

export const profilePhotoApi = {
  // Upload profile photo
  upload: (employeeId, formData) => {
    return axios.post(`/api/v1/employees/${employeeId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete profile photo
  delete: (employeeId) => {
    return axios.delete(`/api/v1/employees/${employeeId}/photo`);
  },

  // Get profile photo info
  get: (employeeId) => {
    return axios.get(`/api/v1/employees/${employeeId}/photo`);
  },
};
