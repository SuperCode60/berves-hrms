import api from '../lib/axios';
export const attendanceApi = {
  records:        (params) => api.get('/attendance', { params }),
  myAttendance:   (params) => api.get('/attendance/my', { params }),
  checkIn:        (data)   => api.post('/attendance/check-in', data),
  checkOut:       (data)   => api.post('/attendance/check-out', data),
  shifts:         (params) => api.get('/shifts/schedules', { params }),
  shiftTemplates: ()       => api.get('/shifts/templates'),
  createSchedule: (data)   => api.post('/shifts/schedules', data),
  bulkSchedule:   (data)   => api.post('/shifts/schedules/bulk', data),
};
