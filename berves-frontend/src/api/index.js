import api from '@/lib/api'
import { buildQuery } from '@/utils/helpers'

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/password', data),
}

// ── Employees ─────────────────────────────────────────────────────────────────
export const employeeApi = {
  list: (params) => api.get(`/employees?${buildQuery(params)}`),
  get: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  uploadDocument: (id, data) => api.post(`/employees/${id}/documents`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  documents: (id) => api.get(`/employees/${id}/documents`),
  allowances: (id) => api.get(`/employees/${id}/allowances`),
  addAllowance: (id, data) => api.post(`/employees/${id}/allowances`, data),
  updateAllowance: (id, allowanceId, data) => api.put(`/employees/${id}/allowances/${allowanceId}`, data),
  deleteAllowance: (id, allowanceId) => api.delete(`/employees/${id}/allowances/${allowanceId}`),
}

// ── Departments & Sites ───────────────────────────────────────────────────────
export const departmentApi = {
  list: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
}

export const siteApi = {
  list: () => api.get('/sites'),
  get: (id) => api.get(`/sites/${id}`),
  create: (data) => api.post('/sites', data),
  update: (id, data) => api.put(`/sites/${id}`, data),
}

export const jobTitleApi = {
  list: (params) => api.get(`/job-titles?${buildQuery(params)}`),
  create: (data) => api.post('/job-titles', data),
  update: (id, data) => api.put(`/job-titles/${id}`, data),
}

// ── Payroll ───────────────────────────────────────────────────────────────────
export const payrollApi = {
  periods: (params) => api.get(`/payroll/periods?${buildQuery(params)}`),
  getPeriod: (id) => api.get(`/payroll/periods/${id}`),
  createPeriod: (data) => api.post('/payroll/periods', data),
  runPayroll: (periodId) => api.post(`/payroll/periods/${periodId}/run`),
  approvePeriod: (periodId) => api.post(`/payroll/periods/${periodId}/approve`),
  runs: (periodId) => api.get(`/payroll/periods/${periodId}/runs`),
  getRun: (id) => api.get(`/payroll/runs/${id}`),
  downloadPayslip: (id) => api.get(`/payroll/runs/${id}/payslip`, { responseType: 'blob' }),
  overtimeRecords: (params) => api.get(`/payroll/overtime?${buildQuery(params)}`),
  createOvertime: (data) => api.post('/payroll/overtime', data),
  approveOvertime: (id) => api.post(`/payroll/overtime/${id}/approve`),
  loans: (params) => api.get(`/payroll/loans?${buildQuery(params)}`),
  createLoan: (data) => api.post('/payroll/loans', data),
  taxConfig: () => api.get('/payroll/tax-config'),
  updateTaxConfig: (data) => api.put('/payroll/tax-config', data),
}

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceApi = {
  list: (params) => api.get(`/attendance?${buildQuery(params)}`),
  myToday: () => api.get('/attendance/my/today'),
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  shiftTemplates: () => api.get('/attendance/shift-templates'),
  createShiftTemplate: (data) => api.post('/attendance/shift-templates', data),
  schedules: (params) => api.get(`/attendance/schedules?${buildQuery(params)}`),
  createSchedule: (data) => api.post('/attendance/schedules', data),
  bulkSchedule: (data) => api.post('/attendance/schedules/bulk', data),
}

// ── Leave ─────────────────────────────────────────────────────────────────────
export const leaveApi = {
  types: () => api.get('/leave/types'),
  createType: (data) => api.post('/leave/types', data),
  myEntitlements: () => api.get('/leave/my/entitlements'),
  myRequests: (params) => api.get(`/leave/my/requests?${buildQuery(params)}`),
  allRequests: (params) => api.get(`/leave/requests?${buildQuery(params)}`),
  submitRequest: (data) => api.post('/leave/requests', data),
  approveRequest: (id, data) => api.post(`/leave/requests/${id}/approve`, data),
  rejectRequest: (id, data) => api.post(`/leave/requests/${id}/reject`, data),
  cancelRequest: (id) => api.post(`/leave/requests/${id}/cancel`),
  offDayRequests: (params) => api.get(`/leave/off-day?${buildQuery(params)}`),
  submitOffDay: (data) => api.post('/leave/off-day', data),
  approveOffDay: (id) => api.post(`/leave/off-day/${id}/approve`),
  rejectOffDay: (id) => api.post(`/leave/off-day/${id}/reject`),
  publicHolidays: (year) => api.get(`/leave/public-holidays?year=${year}`),
}

// ── Recruitment ───────────────────────────────────────────────────────────────
export const recruitmentApi = {
  postings: (params) => api.get(`/recruitment/postings?${buildQuery(params)}`),
  getPosting: (id) => api.get(`/recruitment/postings/${id}`),
  createPosting: (data) => api.post('/recruitment/postings', data),
  updatePosting: (id, data) => api.put(`/recruitment/postings/${id}`, data),
  applicants: (postingId, params) => api.get(`/recruitment/postings/${postingId}/applicants?${buildQuery(params)}`),
  allApplicants: (params) => api.get(`/recruitment/applicants?${buildQuery(params)}`),
  updateApplicantStatus: (id, data) => api.put(`/recruitment/applicants/${id}/status`, data),
  interviews: (applicantId) => api.get(`/recruitment/applicants/${applicantId}/interviews`),
  scheduleInterview: (data) => api.post('/recruitment/interviews', data),
  submitEvaluation: (interviewId, data) => api.post(`/recruitment/interviews/${interviewId}/evaluate`, data),
  onboardingChecklists: () => api.get('/recruitment/onboarding/checklists'),
  employeeOnboarding: (employeeId) => api.get(`/recruitment/onboarding/${employeeId}`),
  updateOnboarding: (employeeId, checklistId, data) => api.put(`/recruitment/onboarding/${employeeId}/${checklistId}`, data),
}

// ── Training ──────────────────────────────────────────────────────────────────
export const trainingApi = {
  programs: (params) => api.get(`/training/programs?${buildQuery(params)}`),
  getProgram: (id) => api.get(`/training/programs/${id}`),
  createProgram: (data) => api.post('/training/programs', data),
  updateProgram: (id, data) => api.put(`/training/programs/${id}`, data),
  enrollments: (params) => api.get(`/training/enrollments?${buildQuery(params)}`),
  enroll: (data) => api.post('/training/enrollments', data),
  updateEnrollment: (id, data) => api.put(`/training/enrollments/${id}`, data),
  myEnrollments: () => api.get('/training/my/enrollments'),
  expiringCerts: () => api.get('/training/expiring'),
}

// ── Performance ───────────────────────────────────────────────────────────────
export const performanceApi = {
  kpis: (params) => api.get(`/performance/kpis?${buildQuery(params)}`),
  createKpi: (data) => api.post('/performance/kpis', data),
  cycles: () => api.get('/performance/cycles'),
  createCycle: (data) => api.post('/performance/cycles', data),
  appraisals: (params) => api.get(`/performance/appraisals?${buildQuery(params)}`),
  getAppraisal: (id) => api.get(`/performance/appraisals/${id}`),
  createAppraisal: (data) => api.post('/performance/appraisals', data),
  submitAppraisal: (id) => api.post(`/performance/appraisals/${id}/submit`),
  updateKpiScore: (appraisalId, kpiId, data) => api.put(`/performance/appraisals/${appraisalId}/kpis/${kpiId}`, data),
}

// ── Safety ────────────────────────────────────────────────────────────────────
export const safetyApi = {
  incidents: (params) => api.get(`/safety/incidents?${buildQuery(params)}`),
  getIncident: (id) => api.get(`/safety/incidents/${id}`),
  reportIncident: (data) => api.post('/safety/incidents', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateIncident: (id, data) => api.put(`/safety/incidents/${id}`, data),
  inspections: (params) => api.get(`/safety/inspections?${buildQuery(params)}`),
  createInspection: (data) => api.post('/safety/inspections', data),
  updateInspection: (id, data) => api.put(`/safety/inspections/${id}`, data),
}

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsApi = {
  payroll: (params) => api.get(`/reports/payroll?${buildQuery(params)}`),
  attendance: (params) => api.get(`/reports/attendance?${buildQuery(params)}`),
  leave: (params) => api.get(`/reports/leave?${buildQuery(params)}`),
  overtime: (params) => api.get(`/reports/overtime?${buildQuery(params)}`),
  headcount: (params) => api.get(`/reports/headcount?${buildQuery(params)}`),
  exportPdf: (type, params) => api.get(`/reports/${type}/export/pdf?${buildQuery(params)}`, { responseType: 'blob' }),
  exportExcel: (type, params) => api.get(`/reports/${type}/export/excel?${buildQuery(params)}`, { responseType: 'blob' }),
}

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsApi = {
  all: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  overtimePolicies: () => api.get('/settings/overtime-policies'),
  updateOvertimePolicies: (data) => api.put('/settings/overtime-policies', data),
  leavePolicies: () => api.get('/settings/leave-policies'),
  updateLeavePolicy: (id, data) => api.put(`/settings/leave-policies/${id}`, data),
  payrollCycle: () => api.get('/settings/payroll-cycle'),
  updatePayrollCycle: (data) => api.put('/settings/payroll-cycle', data),
  roles: () => api.get('/settings/roles'),
  updateRolePermissions: (roleId, data) => api.put(`/settings/roles/${roleId}/permissions`, data),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  recentActivity: () => api.get('/dashboard/activity'),
  payrollSummary: () => api.get('/dashboard/payroll-summary'),
  attendanceSummary: () => api.get('/dashboard/attendance-summary'),
  leaveSummary: () => api.get('/dashboard/leave-summary'),
}
