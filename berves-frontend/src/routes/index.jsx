import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppLayout }         from '../components/layout/AppLayout';
import { LoginPage }         from '../pages/auth/LoginPage';
import { DashboardPage }     from '../pages/dashboard/DashboardPage';
import { HRDashboardPage }  from '../pages/dashboard/HRDashboardPage';
import { EmployeesPage }     from '../pages/employees/EmployeesPage';
import { EmployeeDetailPage} from '../pages/employees/EmployeeDetailPage';
import { EmployeeFormPage }  from '../pages/employees/EmployeeFormPage';
import { PayrollPage }       from '../pages/payroll/PayrollPage';
import { PayrollPeriodPage } from '../pages/payroll/PayrollPeriodPage';
import { OvertimePage }      from '../pages/payroll/OvertimePage';
import { LoansPage }         from '../pages/payroll/LoansPage';
import { PayslipsPage }      from '../pages/payroll/PayslipsPage';
import { AttendancePage }    from '../pages/attendance/AttendancePage';
import { ShiftSchedulePage } from '../pages/attendance/ShiftSchedulePage';
import { SitesPage }          from '../pages/employees/SitesPage';
import { DepartmentsPage }   from '../pages/employees/DepartmentsPage';
import { LeavePage }          from '../pages/leave/LeavePage';
import { LeaveRequestPage }  from '../pages/leave/LeaveRequestPage';
import { OffDayRequestPage } from '../pages/leave/OffDayRequestPage';
import { OffDaysListPage }   from '../pages/leave/OffDaysListPage';
import { RecruitmentPage }   from '../pages/recruitment/RecruitmentPage';
import { ApplicantsPage }    from '../pages/recruitment/ApplicantsPage';
import { OnboardingPage }    from '../pages/recruitment/OnboardingPage';
import { TrainingPage }      from '../pages/training/TrainingPage';
import { PerformancePage }   from '../pages/performance/PerformancePage';
import { AppraisalPage }     from '../pages/performance/AppraisalPage';
import { SafetyPage }        from '../pages/safety/SafetyPage';
import { ReportsPage }       from '../pages/reports/ReportsPage';
import { SettingsPage }      from '../pages/settings/SettingsPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';

// ── Route guards ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, hasRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !hasRole(roles)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Route tree ─────────────────────────────────────────────────────────────
export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />

    <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="/dashboard" replace />} />

      {/* Dashboard — all authenticated */}
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="dashboard/hr" element={<ProtectedRoute roles={['admin','hr']}><HRDashboardPage /></ProtectedRoute>} />

      {/* Employees — read: admin|hr|manager; write: admin|hr (enforced per-page) */}
      <Route path="employees" element={<ProtectedRoute roles={['admin','hr','manager']}><EmployeesPage /></ProtectedRoute>} />
      <Route path="employees/new"         element={<ProtectedRoute roles={['admin','hr']}><EmployeeFormPage /></ProtectedRoute>} />
      <Route path="employees/:id"         element={<ProtectedRoute roles={['admin','hr','manager']}><EmployeeDetailPage /></ProtectedRoute>} />
      <Route path="employees/:id/edit"    element={<ProtectedRoute roles={['admin','hr']}><EmployeeFormPage /></ProtectedRoute>} />
      <Route path="employees/sites"       element={<ProtectedRoute roles={['admin','hr']}><SitesPage /></ProtectedRoute>} />
      <Route path="employees/departments" element={<ProtectedRoute roles={['admin','hr']}><DepartmentsPage /></ProtectedRoute>} />

      {/* Payroll — admin|hr|payroll_officer */}
      <Route path="payroll"           element={<ProtectedRoute roles={['admin','hr','payroll_officer']}><PayrollPage /></ProtectedRoute>} />
      <Route path="payroll/:periodId" element={<ProtectedRoute roles={['admin','hr','payroll_officer']}><PayrollPeriodPage /></ProtectedRoute>} />
      <Route path="payroll/overtime"  element={<ProtectedRoute roles={['admin','hr','payroll_officer']}><OvertimePage /></ProtectedRoute>} />
      <Route path="payroll/loans"     element={<ProtectedRoute roles={['admin','hr','payroll_officer']}><LoansPage /></ProtectedRoute>} />

      {/* Self-service payslips — all authenticated (own records only) */}
      <Route path="payslips" element={<ProtectedRoute><PayslipsPage /></ProtectedRoute>} />

      {/* Attendance — all authenticated */}
      <Route path="attendance"        element={<AttendancePage />} />
      <Route path="attendance/shifts" element={<ProtectedRoute roles={['admin','hr','manager']}><ShiftSchedulePage /></ProtectedRoute>} />

      {/* Leave — all authenticated */}
      <Route path="leave"                  element={<LeavePage />} />
      <Route path="leave/off-days"         element={<OffDaysListPage />} />
      <Route path="leave/request"          element={<LeaveRequestPage />} />
      <Route path="leave/off-day/request"  element={<OffDayRequestPage />} />

      {/* Recruitment — admin|hr */}
      <Route path="recruitment"                                 element={<ProtectedRoute roles={['admin','hr']}><RecruitmentPage /></ProtectedRoute>} />
      <Route path="recruitment/:postingId/applicants"          element={<ProtectedRoute roles={['admin','hr']}><ApplicantsPage /></ProtectedRoute>} />
      <Route path="recruitment/onboarding/:employeeId"         element={<ProtectedRoute roles={['admin','hr']}><OnboardingPage /></ProtectedRoute>} />

      {/* Training, Performance, Safety — all authenticated */}
      <Route path="training"                       element={<TrainingPage />} />
      <Route path="performance"                    element={<PerformancePage />} />
      <Route path="performance/appraisals/:id"     element={<AppraisalPage />} />
      <Route path="safety"                         element={<SafetyPage />} />

      {/* Reports — admin|hr|payroll_officer */}
      <Route path="reports" element={<ProtectedRoute roles={['admin','hr','payroll_officer']}><ReportsPage /></ProtectedRoute>} />

      {/* Notifications — all authenticated */}
      <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

      {/* Settings — admin only */}
      <Route path="settings" element={<ProtectedRoute roles={['admin']}><SettingsPage /></ProtectedRoute>} />
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);
