import api from '../lib/axios';

export const payrollApi = {
  // Periods
  periods:          (params)   => api.get('/payroll/periods', { params }),
  getPeriod:        (id)       => api.get(`/payroll/periods/${id}`),
  createPeriod:     (data)     => api.post('/payroll/periods', data),
  runPayroll:       (periodId) => api.post(`/payroll/periods/${periodId}/run`),
  approvePeriod:    (periodId) => api.post(`/payroll/periods/${periodId}/approve`),
  rejectPeriod:     (periodId) => api.post(`/payroll/periods/${periodId}/reject`),
  lockPeriod:       (periodId) => api.post(`/payroll/periods/${periodId}/lock`),
  periodSummary:    (periodId) => api.get(`/payroll/periods/${periodId}/summary`),

  // Runs
  runs:             (periodId, params) => api.get(`/payroll/periods/${periodId}/runs`, { params }),
  payslip:          (runId)    => api.get(`/payroll/runs/${runId}/payslip`, { responseType: 'blob' }),
  sendPayslip:      (runId)    => api.post(`/payroll/runs/${runId}/payslip/send`),
  runDetails:       (runId)    => api.get(`/payroll/runs/${runId}/details`),
  recalculate:      (runId)    => api.post(`/payroll/runs/${runId}/recalculate`),
  myPayslips:       (params)   => api.get('/payroll/runs/my-payslips', { params }),

  // Overtime
  overtimeList:     (params)   => api.get('/payroll/overtime', { params }),
  getOvertime:      (id)       => api.get(`/payroll/overtime/${id}`),
  createOvertime:   (data)     => api.post('/payroll/overtime', data),
  updateOvertime:   (id, data) => api.put(`/payroll/overtime/${id}`, data),
  deleteOvertime:   (id)       => api.delete(`/payroll/overtime/${id}`),
  approveOvertime:  (id)       => api.post(`/payroll/overtime/${id}/approve`),
  rejectOvertime:   (id)       => api.post(`/payroll/overtime/${id}/reject`),
  cancelOvertime:   (id)       => api.post(`/payroll/overtime/${id}/cancel`),
  pendingOvertime:  (params)   => api.get('/payroll/overtime/pending', { params }),

  // Loans
  loans:            (params)   => api.get('/payroll/loans', { params }),
  getLoan:          (id)       => api.get(`/payroll/loans/${id}`),
  createLoan:       (data)     => api.post('/payroll/loans', data),
  updateLoan:       (id, data) => api.put(`/payroll/loans/${id}`, data),
  approveLoan:      (id)       => api.post(`/payroll/loans/${id}/approve`),
  rejectLoan:       (id)       => api.post(`/payroll/loans/${id}/reject`),
  addRepayment:     (id, data) => api.post(`/payroll/loans/${id}/repayment`, data),
  repaymentSchedule:(id)       => api.get(`/payroll/loans/${id}/repayment-schedule`),
  pendingLoans:     (params)   => api.get('/payroll/loans/pending', { params }),

  // Settings
  taxConfig:        ()         => api.get('/settings/tax-configurations'),
};
