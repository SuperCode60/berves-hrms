import api from '../lib/axios';

export const reportsApi = {
  payrollSummary:    (params) => api.get('/reports/payroll',     { params }),
  attendanceSummary: (params) => api.get('/reports/attendance',  { params }),
  overtimeReport:    (params) => api.get('/reports/overtime',    { params }),
  leaveReport:       (params) => api.get('/reports/leave',       { params }),
  headcountReport:   (params) => api.get('/reports/headcount',   { params }),

  /**
   * Export as PDF — returns a blob stream.
   * The server falls back to printable HTML if DomPDF isn't installed.
   */
  exportPdf: (type, params) =>
    api.get(`/reports/exports/${type}/pdf`, {
      params,
      responseType: 'blob',
      timeout: 60000,
    }),

  /**
   * Export as CSV — returns a blob stream.
   * Zero server-side dependencies; always works.
   */
  exportCsv: (type, params) =>
    api.get(`/reports/exports/${type}/csv`, {
      params,
      responseType: 'blob',
      timeout: 60000,
    }),

  /**
   * Export as Excel-compatible CSV.
   */
  exportExcel: (type, params) =>
    api.get(`/reports/exports/${type}/excel`, {
      params,
      responseType: 'blob',
      timeout: 60000,
    }),
};
