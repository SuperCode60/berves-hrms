<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Employee\EmployeeController;
use App\Http\Controllers\Api\Employee\DepartmentController;
use App\Http\Controllers\Api\Employee\SiteController;
use App\Http\Controllers\Api\Employee\JobTitleController;
use App\Http\Controllers\Api\Employee\DocumentController;
use App\Http\Controllers\Api\Employee\AllowanceController;
use App\Http\Controllers\Api\Payroll\PayrollPeriodController;
use App\Http\Controllers\Api\Payroll\PayrollRunController;
use App\Http\Controllers\Api\Payroll\OvertimeController;
use App\Http\Controllers\Api\Payroll\LoanController;
use App\Http\Controllers\Api\Attendance\AttendanceController;
use App\Http\Controllers\Api\Attendance\ShiftController;
use App\Http\Controllers\Api\Leave\LeaveTypeController;
use App\Http\Controllers\Api\Leave\LeaveRequestController;
use App\Http\Controllers\Api\Leave\OffDayController;
use App\Http\Controllers\Api\Leave\HolidayController;
use App\Http\Controllers\Api\Leave\EntitlementController;
use App\Http\Controllers\Api\Recruitment\JobPostingController;
use App\Http\Controllers\Api\Recruitment\ApplicantController;
use App\Http\Controllers\Api\Recruitment\InterviewController;
use App\Http\Controllers\Api\Recruitment\OnboardingController;
use App\Http\Controllers\Api\Training\ProgramController;
use App\Http\Controllers\Api\Training\EnrollmentController;
use App\Http\Controllers\Api\Performance\KpiController;
use App\Http\Controllers\Api\Performance\AppraisalCycleController;
use App\Http\Controllers\Api\Performance\AppraisalController;
use App\Http\Controllers\Api\Safety\IncidentController;
use App\Http\Controllers\Api\Safety\InspectionController;
use App\Http\Controllers\Api\Reports\ReportController;
use App\Http\Controllers\Api\Settings\SettingController;
use App\Http\Controllers\Api\Settings\OvertimePolicyController;
use App\Http\Controllers\Api\Settings\LeavePolicyController;
use App\Http\Controllers\Api\Settings\RoleController;
use App\Http\Controllers\Api\Settings\PermissionController;
use App\Http\Controllers\Api\Settings\RoleAssignmentController;
use App\Http\Controllers\Api\Dashboard\DashboardController;
use App\Http\Controllers\Api\Notification\NotificationController;
use App\Http\Controllers\Api\Settings\BackupController;

// Fallback 401 for unauthenticated API hits
Route::any('/login', function () {
    return response()->json([
        'success' => false,
        'message' => 'Unauthenticated',
        'error'   => 'Please provide a valid authentication token',
    ], 401);
})->name('login');

/*
|--------------------------------------------------------------------------
| API Routes — Version 1
| RBAC is enforced on every sensitive group via role:... middleware.
| Roles: admin | hr | manager | payroll_officer | employee
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {

    // ── API Root Info (FIXED: Added this to prevent 404 on /v1) ──
    Route::get('/', function () {
        return response()->json([
            'success' => true,
            'app' => 'Berves HRMS API',
            'version' => '1.0.0',
            'status' => 'running',
            'endpoints' => [
                'public' => [
                    'POST /auth/login' => 'Login with email and password',
                    'POST /auth/forgot-password' => 'Request password reset',
                    'POST /auth/reset-password' => 'Reset password with token',
                ],
                'authenticated' => [
                    'GET /auth/me' => 'Get current user profile',
                    'POST /auth/logout' => 'Logout and invalidate token',
                    'GET /dashboard/stats' => 'Get dashboard statistics',
                    'GET /employees' => 'List employees',
                    'GET /leave/types' => 'Get leave types',
                    'POST /attendance/check-in' => 'Record check-in time',
                    'POST /attendance/check-out' => 'Record check-out time',
                    'GET /payroll/runs/my-payslips' => 'Get my payslips',
                ],
                'admin_only' => [
                    'GET /settings' => 'System settings',
                    'GET /roles' => 'Manage roles',
                    'GET /permissions' => 'Manage permissions',
                    'POST /backups' => 'Create database backup',
                ],
            ],
            'documentation' => 'https://berves-hrms-production.up.railway.app/api/docs',
            'timestamp' => now()->toIso8601String(),
        ]);
    });

    // ── Public Routes ──────────────────────────────────────────────────────
    Route::post('/auth/login',           [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password',  [AuthController::class, 'resetPassword']);

    // ── Protected Routes ───────────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

        // ========== AUTHENTICATION (any authenticated user) ==========
        Route::prefix('auth')->group(function () {
            Route::get('/me',               [AuthController::class, 'me']);
            Route::post('/logout',          [AuthController::class, 'logout']);
            Route::post('/change-password', [AuthController::class, 'changePassword']);
            Route::post('/refresh-token',   [AuthController::class, 'refreshToken']);
            Route::get('/permissions',      [AuthController::class, 'permissions']);
        });

        // ========== NOTIFICATIONS ==========
        Route::prefix('notifications')->group(function () {
            Route::get('/',              [NotificationController::class, 'index']);
            Route::get('/unread-count',  [NotificationController::class, 'unreadCount']);
            Route::post('/mark-all-read',[NotificationController::class, 'markAllRead']);
            Route::post('/{notification}/read',   [NotificationController::class, 'markRead']);
            Route::delete('/{notification}',       [NotificationController::class, 'destroy']);
        });

        // ========== DASHBOARD ==========
        Route::prefix('dashboard')->group(function () {
            Route::get('/stats',            [DashboardController::class, 'stats']);
            Route::get('/hr-stats',         [DashboardController::class, 'hrStats']);
            Route::get('/leave-trend',      [DashboardController::class, 'leaveTrend']);
            Route::get('/activity',         [DashboardController::class, 'activity']);
            Route::get('/attendance-chart', [DashboardController::class, 'attendanceChart']);
            Route::get('/upcoming-events',  [DashboardController::class, 'upcomingEvents']);
            Route::get('/recent-employees', [DashboardController::class, 'recentEmployees']);
        });

        // ========== EMPLOYEES ==========
        Route::middleware(['role:admin,hr,manager'])->group(function () {
            Route::apiResource('employees', EmployeeController::class)->only(['index','show']);
            Route::prefix('employees/{employee}')->group(function () {
                Route::apiResource('documents', DocumentController::class)->except(['create','edit'])->only(['index','show']);
                Route::get('/audit-log', [EmployeeController::class, 'auditLog']);
            });
        });

        // Write-access on employees — admin, hr only
        Route::middleware(['role:admin,hr'])->group(function () {
            Route::apiResource('employees', EmployeeController::class)->except(['index','show']);
            Route::prefix('employees/{employee}')->group(function () {
                Route::post('/photo',           [EmployeeController::class, 'uploadPhoto']);
                Route::delete('/photo',         [App\Http\Controllers\Api\Employee\ProfilePhotoController::class, 'destroy']);
                Route::get('/photo',            [App\Http\Controllers\Api\Employee\ProfilePhotoController::class, 'show']);
                Route::post('/assign-manager',  [EmployeeController::class, 'assignManager']);
                Route::apiResource('documents', DocumentController::class)->except(['create','edit','index','show']);
                Route::post('documents/{document}/restore',   [DocumentController::class, 'restore']);
                Route::delete('documents/{document}/force',   [DocumentController::class, 'forceDelete']);
                Route::apiResource('allowances', AllowanceController::class)->except(['create','edit']);
                Route::post('/activate',         [EmployeeController::class, 'activate']);
                Route::post('/deactivate',       [EmployeeController::class, 'deactivate']);
                Route::post('/archive',          [EmployeeController::class, 'archive']);
                Route::post('/restore',          [EmployeeController::class, 'restore']);
                Route::post('/bulk-assign-shift',[EmployeeController::class, 'bulkAssignShift']);
            });
            Route::prefix('employees')->group(function () {
                Route::post('/bulk-import',   [EmployeeController::class, 'bulkImport']);
                Route::post('/bulk-export',   [EmployeeController::class, 'bulkExport']);
                Route::delete('/bulk-delete', [EmployeeController::class, 'bulkDelete']);
                Route::post('/bulk-activate', [EmployeeController::class, 'bulkActivate']);
            });
        });

        // ========== LOOKUP / MASTER DATA ==========
        Route::middleware(['role:admin,hr'])->group(function () {
            Route::apiResource('departments', DepartmentController::class);
            Route::prefix('departments')->group(function () {
                Route::get('/tree',                        [DepartmentController::class, 'tree']);
                Route::post('/{department}/employees',     [DepartmentController::class, 'assignEmployees']);
                Route::get('/{department}/employees',      [DepartmentController::class, 'employees']);
            });
            Route::apiResource('job-titles', JobTitleController::class);
            Route::prefix('job-titles')->group(function () {
                Route::get('/by-department/{department}',  [JobTitleController::class, 'byDepartment']);
                Route::post('/{jobTitle}/salary-range',    [JobTitleController::class, 'updateSalaryRange']);
            });
            Route::apiResource('sites', SiteController::class);
            Route::prefix('sites')->group(function () {
                Route::get('/{site}/employees',   [SiteController::class, 'employees']);
                Route::post('/{site}/activate',   [SiteController::class, 'activate']);
                Route::post('/{site}/deactivate', [SiteController::class, 'deactivate']);
            });
        });

        // ========== PAYROLL ==========
        Route::middleware(['role:admin,hr,payroll_officer'])->prefix('payroll')->group(function () {
            Route::apiResource('periods', PayrollPeriodController::class);
            Route::prefix('periods/{period}')->group(function () {
                Route::post('/run',     [PayrollPeriodController::class, 'run']);
                Route::post('/approve', [PayrollPeriodController::class, 'approve']);
                Route::post('/reject',  [PayrollPeriodController::class, 'reject']);
                Route::post('/lock',    [PayrollPeriodController::class, 'lock']);
                Route::get('/runs',     [PayrollRunController::class, 'index']);
                Route::get('/summary',  [PayrollPeriodController::class, 'summary']);
            });
            Route::prefix('runs')->group(function () {
                Route::get('/{run}/payslip',         [PayrollRunController::class, 'payslip']);
                Route::post('/{run}/payslip/send',   [PayrollRunController::class, 'sendPayslip']);
                Route::get('/{run}/details',         [PayrollRunController::class, 'details']);
                Route::post('/{run}/recalculate',    [PayrollRunController::class, 'recalculate']);
            });
            Route::apiResource('overtime', OvertimeController::class);
            Route::prefix('overtime')->group(function () {
                Route::post('/{overtime}/approve', [OvertimeController::class, 'approve']);
                Route::post('/{overtime}/reject',  [OvertimeController::class, 'reject']);
                Route::post('/{overtime}/cancel',  [OvertimeController::class, 'cancel']);
                Route::get('/pending',             [OvertimeController::class, 'pending']);
                Route::get('/approved',            [OvertimeController::class, 'approved']);
                Route::get('/by-employee/{employee}', [OvertimeController::class, 'byEmployee']);
            });
            Route::apiResource('loans', LoanController::class);
            Route::prefix('loans')->group(function () {
                Route::post('/{loan}/approve',            [LoanController::class, 'approve']);
                Route::post('/{loan}/reject',             [LoanController::class, 'reject']);
                Route::post('/{loan}/repayment',          [LoanController::class, 'addRepayment']);
                Route::get('/{loan}/repayment-schedule',  [LoanController::class, 'repaymentSchedule']);
                Route::get('/pending',                    [LoanController::class, 'pending']);
            });
            Route::prefix('reports')->group(function () {
                Route::get('/salary-summary',    [ReportController::class, 'salarySummary']);
                Route::get('/deduction-summary', [ReportController::class, 'deductionSummary']);
                Route::get('/tax-summary',       [ReportController::class, 'taxSummary']);
            });
        });

        Route::get('/payroll/runs/my-payslips', [PayrollRunController::class, 'myPayslips']);

        // ========== ATTENDANCE ==========
        Route::prefix('attendance')->group(function () {
            Route::get('/my',                    [AttendanceController::class, 'myAttendance']);
            Route::get('/',                      [AttendanceController::class, 'index']);
            Route::get('/{attendance}',          [AttendanceController::class, 'show']);
            Route::post('/check-in',             [AttendanceController::class, 'checkIn']);
            Route::post('/check-out',            [AttendanceController::class, 'checkOut']);
            Route::get('/by-date',               [AttendanceController::class, 'byDate']);
            Route::get('/by-employee/{employee}',[AttendanceController::class, 'byEmployee']);
        });
        
        Route::middleware(['role:admin,hr,manager'])->prefix('attendance')->group(function () {
            Route::post('/{attendance}/adjust',  [AttendanceController::class, 'adjust']);
            Route::get('/summary',               [AttendanceController::class, 'summary']);
            Route::get('/late-arrivals',         [AttendanceController::class, 'lateArrivals']);
            Route::get('/absent-today',          [AttendanceController::class, 'absentToday']);
            Route::post('/bulk-check-in',        [AttendanceController::class, 'bulkCheckIn']);
        });

        // ========== SHIFTS ==========
        Route::middleware(['role:admin,hr,manager'])->prefix('shifts')->group(function () {
            Route::get('/templates',                [ShiftController::class, 'templates']);
            Route::post('/templates',               [ShiftController::class, 'storeTemplate']);
            Route::get('/templates/{template}',     [ShiftController::class, 'showTemplate']);
            Route::put('/templates/{template}',     [ShiftController::class, 'updateTemplate']);
            Route::delete('/templates/{template}',  [ShiftController::class, 'deleteTemplate']);
            Route::get('/schedules',                [ShiftController::class, 'schedules']);
            Route::post('/schedules',               [ShiftController::class, 'storeSchedule']);
            Route::post('/schedules/bulk',          [ShiftController::class, 'bulkSchedule']);
            Route::get('/schedules/{schedule}',     [ShiftController::class, 'showSchedule']);
            Route::put('/schedules/{schedule}',     [ShiftController::class, 'updateSchedule']);
            Route::delete('/schedules/{schedule}',  [ShiftController::class, 'deleteSchedule']);
            Route::get('/schedules/by-employee/{employee}', [ShiftController::class, 'employeeSchedule']);
            Route::get('/schedules/current-week',           [ShiftController::class, 'currentWeekSchedule']);
        });

        // ========== LEAVE ==========
        Route::prefix('leave')->group(function () {
            Route::get('types',             [LeaveTypeController::class, 'index']);
            Route::get('types/{type}',      [LeaveTypeController::class, 'show']);
            Route::get('holidays',          [HolidayController::class, 'index']);
            Route::get('holidays/upcoming', [HolidayController::class, 'upcoming']);
            Route::get('holidays/calendar/{year}', [HolidayController::class, 'calendar']);
            Route::apiResource('requests', LeaveRequestController::class)->except(['create','edit']);
            Route::post('requests/{request}/cancel', [LeaveRequestController::class, 'cancel']);
            Route::get('requests/by-employee/{employee}', [LeaveRequestController::class, 'byEmployee']);
            Route::apiResource('off-days', OffDayController::class)->except(['create','edit']);
            Route::get('entitlements',                        [EntitlementController::class, 'index']);
            Route::get('entitlements/by-employee/{employee}', [EntitlementController::class, 'byEmployee']);
        });
        
        Route::middleware(['role:admin,hr,manager'])->prefix('leave')->group(function () {
            Route::apiResource('types', LeaveTypeController::class)->except(['index','show']);
            Route::post('types/{type}/activate',   [LeaveTypeController::class, 'activate']);
            Route::post('types/{type}/deactivate', [LeaveTypeController::class, 'deactivate']);
            Route::get('types/{type}/entitlements',[LeaveTypeController::class, 'entitlements']);
            Route::post('requests/{request}/review',  [LeaveRequestController::class, 'review']);
            Route::post('requests/{request}/approve', [LeaveRequestController::class, 'approve']);
            Route::post('requests/{request}/reject',  [LeaveRequestController::class, 'reject']);
            Route::get('requests/pending',   [LeaveRequestController::class, 'pending']);
            Route::get('requests/approved',  [LeaveRequestController::class, 'approved']);
            Route::get('requests/rejected',  [LeaveRequestController::class, 'rejected']);
            Route::get('calendar',           [LeaveRequestController::class, 'calendar']);
            Route::post('off-days/{offDay}/review',  [OffDayController::class, 'review']);
            Route::post('off-days/{offDay}/approve', [OffDayController::class, 'approve']);
            Route::post('off-days/{offDay}/reject',  [OffDayController::class, 'reject']);
            Route::apiResource('entitlements', EntitlementController::class)->except(['create','edit','index']);
            Route::post('entitlements/bulk-assign',          [EntitlementController::class, 'bulkAssign']);
            Route::post('entitlements/{entitlement}/adjust', [EntitlementController::class, 'adjust']);
            Route::apiResource('holidays', HolidayController::class)->except(['index']);
            Route::post('holidays/bulk-create', [HolidayController::class, 'bulkCreate']);
        });

        // ========== RECRUITMENT ==========
        Route::middleware(['role:admin,hr'])->prefix('recruitment')->group(function () {
            Route::apiResource('postings', JobPostingController::class);
            Route::prefix('postings/{posting}')->group(function () {
                Route::post('/publish',   [JobPostingController::class, 'publish']);
                Route::post('/close',     [JobPostingController::class, 'close']);
                Route::post('/duplicate', [JobPostingController::class, 'duplicate']);
                Route::get('/applicants',[ApplicantController::class, 'index']);
                Route::get('/stats',     [JobPostingController::class, 'stats']);
            });
            Route::apiResource('applicants', ApplicantController::class);
            Route::prefix('applicants')->group(function () {
                Route::post('/{applicant}/shortlist',     [ApplicantController::class, 'shortlist']);
                Route::post('/{applicant}/reject',        [ApplicantController::class, 'reject']);
                Route::post('/{applicant}/hire',          [ApplicantController::class, 'hire']);
                Route::post('/{applicant}/download-cv',   [ApplicantController::class, 'downloadCV']);
                Route::post('/bulk-import',               [ApplicantController::class, 'bulkImport']);
                Route::get('/status/{status}',            [ApplicantController::class, 'byStatus']);
            });
            Route::apiResource('interviews', InterviewController::class);
            Route::prefix('interviews/{interview}')->group(function () {
                Route::post('/evaluate',   [InterviewController::class, 'evaluate']);
                Route::post('/reschedule', [InterviewController::class, 'reschedule']);
                Route::post('/cancel',     [InterviewController::class, 'cancel']);
                Route::get('/feedback',    [InterviewController::class, 'feedback']);
            });
            Route::prefix('onboarding')->group(function () {
                Route::get('/employee/{employee}',              [OnboardingController::class, 'show']);
                Route::post('/task/{task}/complete',            [OnboardingController::class, 'complete']);
                Route::post('/task/{task}/skip',                [OnboardingController::class, 'skip']);
                Route::get('/checklist/{employee}',             [OnboardingController::class, 'checklist']);
                Route::post('/send-welcome-kit/{employee}',     [OnboardingController::class, 'sendWelcomeKit']);
            });
        });

        // ========== TRAINING ==========
        Route::prefix('training')->group(function () {
            Route::apiResource('programs',    ProgramController::class)->only(['index','show']);
            Route::apiResource('enrollments', EnrollmentController::class)->only(['index','show']);
            Route::get('enrollments/by-employee/{employee}', [EnrollmentController::class, 'byEmployee']);
            Route::get('enrollments/expiring',               [EnrollmentController::class, 'expiring']);
        });
        
        Route::middleware(['role:admin,hr'])->prefix('training')->group(function () {
            Route::apiResource('programs', ProgramController::class)->except(['index','show']);
            Route::prefix('programs/{program}')->group(function () {
                Route::post('/activate',    [ProgramController::class, 'activate']);
                Route::post('/deactivate',  [ProgramController::class, 'deactivate']);
                Route::get('/enrollments',  [ProgramController::class, 'enrollments']);
                Route::post('/duplicate',   [ProgramController::class, 'duplicate']);
                Route::get('/materials',    [ProgramController::class, 'materials']);
            });
            Route::apiResource('enrollments', EnrollmentController::class)->except(['index','show']);
            Route::prefix('enrollments')->group(function () {
                Route::post('/{enrollment}/complete',     [EnrollmentController::class, 'complete']);
                Route::post('/{enrollment}/certificate',  [EnrollmentController::class, 'generateCertificate']);
                Route::post('/bulk-enroll',               [EnrollmentController::class, 'bulkEnroll']);
            });
        });

        // ========== PERFORMANCE ==========
        Route::prefix('performance')->group(function () {
            Route::apiResource('kpis',  KpiController::class)->only(['index','show']);
            Route::get('kpis/by-department/{department}', [KpiController::class, 'byDepartment']);
            Route::apiResource('cycles', AppraisalCycleController::class)->only(['index','show']);
            Route::apiResource('appraisals', AppraisalController::class)->only(['index','show','update']);
            Route::post('appraisals/{appraisal}/submit',   [AppraisalController::class, 'submit']);
            Route::post('appraisals/{appraisal}/feedback', [AppraisalController::class, 'addFeedback']);
            Route::put('appraisals/{appraisal}/kpis/{kpi}',[AppraisalController::class, 'updateKpiScore']);
            Route::get('appraisals/self',                  [AppraisalController::class, 'selfAppraisal']);
            Route::get('appraisals/team',                  [AppraisalController::class, 'teamAppraisals']);
            Route::get('appraisals/{appraisal}/pdf',       [AppraisalController::class, 'generatePDF']);
        });
        
        Route::middleware(['role:admin,hr,manager'])->prefix('performance')->group(function () {
            Route::apiResource('kpis', KpiController::class)->except(['index','show']);
            Route::post('kpis/{kpi}/activate',   [KpiController::class, 'activate']);
            Route::post('kpis/{kpi}/deactivate', [KpiController::class, 'deactivate']);
            Route::apiResource('cycles', AppraisalCycleController::class)->except(['index','show']);
            Route::post('cycles/{cycle}/start',      [AppraisalCycleController::class, 'start']);
            Route::post('cycles/{cycle}/close',      [AppraisalCycleController::class, 'close']);
            Route::get('cycles/{cycle}/appraisals',  [AppraisalController::class, 'index']);
            Route::get('cycles/{cycle}/progress',    [AppraisalCycleController::class, 'progress']);
            Route::apiResource('appraisals', AppraisalController::class)->only(['store','destroy']);
            Route::post('appraisals/{appraisal}/approve', [AppraisalController::class, 'approve']);
            Route::post('appraisals/{appraisal}/reject',  [AppraisalController::class, 'reject']);
        });

        // ========== SAFETY ==========
        Route::prefix('safety')->group(function () {
            Route::apiResource('incidents',   IncidentController::class)->only(['index','show','store']);
            Route::apiResource('inspections', InspectionController::class)->only(['index','show']);
        });
        
        Route::middleware(['role:admin,hr,manager'])->prefix('safety')->group(function () {
            Route::apiResource('incidents', IncidentController::class)->except(['index','show','store']);
            Route::prefix('incidents/{incident}')->group(function () {
                Route::post('/investigate',  [IncidentController::class, 'investigate']);
                Route::post('/resolve',      [IncidentController::class, 'resolve']);
                Route::post('/attach-report',[IncidentController::class, 'attachReport']);
                Route::get('/timeline',      [IncidentController::class, 'timeline']);
            });
            Route::apiResource('inspections', InspectionController::class)->except(['index','show']);
            Route::prefix('inspections/{inspection}')->group(function () {
                Route::post('/schedule',                  [InspectionController::class, 'schedule']);
                Route::post('/complete',                  [InspectionController::class, 'complete']);
                Route::post('/add-finding',               [InspectionController::class, 'addFinding']);
                Route::post('/resolve-finding/{finding}', [InspectionController::class, 'resolveFinding']);
            });
            Route::prefix('reports')->group(function () {
                Route::get('/incident-stats',  [IncidentController::class, 'stats']);
                Route::get('/inspection-stats',[InspectionController::class, 'stats']);
                Route::get('/safety-metrics',  [IncidentController::class, 'safetyMetrics']);
            });
        });

        // ========== REPORTS ==========
        Route::middleware(['role:admin,hr,payroll_officer'])->prefix('reports')->group(function () {
            Route::get('/payroll',     [ReportController::class, 'payroll']);
            Route::get('/attendance',  [ReportController::class, 'attendance']);
            Route::get('/overtime',    [ReportController::class, 'overtime']);
            Route::get('/leave',       [ReportController::class, 'leave']);
            Route::get('/headcount',   [ReportController::class, 'headcount']);
            Route::get('/turnover',    [ReportController::class, 'turnover']);
            Route::get('/recruitment', [ReportController::class, 'recruitment']);
            Route::get('/training',    [ReportController::class, 'training']);
            Route::get('/performance', [ReportController::class, 'performance']);
            Route::get('/safety',      [ReportController::class, 'safety']);
            Route::prefix('exports')->group(function () {
                Route::get('/{type}/pdf',   [ReportController::class, 'exportPdf']);
                Route::get('/{type}/excel', [ReportController::class, 'exportExcel']);
                Route::get('/{type}/csv',   [ReportController::class, 'exportCsv']);
            });
            Route::prefix('scheduled')->group(function () {
                Route::get('/',           [ReportController::class, 'scheduledReports']);
                Route::post('/',          [ReportController::class, 'scheduleReport']);
                Route::put('/{schedule}', [ReportController::class, 'updateSchedule']);
                Route::delete('/{schedule}', [ReportController::class, 'deleteSchedule']);
            });
            Route::post('/custom',       [ReportController::class, 'customReport']);
            Route::post('/custom/save',  [ReportController::class, 'saveCustomReport']);
            Route::get('/custom/saved',  [ReportController::class, 'savedCustomReports']);
        });

        // ========== SETTINGS — admin only ==========
        Route::middleware(['role:admin'])->prefix('settings')->group(function () {
            Route::get('/',              [SettingController::class, 'index']);
            Route::put('/{key}',         [SettingController::class, 'update']);
            Route::post('/reset',        [SettingController::class, 'resetToDefault']);
            Route::apiResource('overtime-policies', OvertimePolicyController::class);
            Route::post('overtime-policies/{policy}/activate',   [OvertimePolicyController::class, 'activate']);
            Route::post('overtime-policies/{policy}/deactivate', [OvertimePolicyController::class, 'deactivate']);
            Route::apiResource('leave-policies', LeavePolicyController::class);
            Route::post('leave-policies/{policy}/activate',      [LeavePolicyController::class, 'activate']);
            Route::post('leave-policies/{policy}/deactivate',    [LeavePolicyController::class, 'deactivate']);
            Route::get('leave-policies/{policy}/apply-to-department', [LeavePolicyController::class, 'applyToDepartment']);
            
            Route::get('leave-policies/{leaveTypeId}/entitlements', [LeavePolicyController::class, 'getEntitlements']);
            Route::put('leave-entitlements/{entitlementId}', [LeavePolicyController::class, 'updateEntitlement']);
            Route::post('leave-policies/{leaveTypeId}/bulk-update-entitlements', [LeavePolicyController::class, 'bulkUpdateEntitlements']);
            Route::get('/payroll-cycle',     [SettingController::class, 'payrollCycle']);
            Route::put('/payroll-cycle',     [SettingController::class, 'updatePayrollCycle']);
            Route::get('/tax-configurations',[SettingController::class, 'taxConfigurations']);
            Route::put('/tax-configurations',[SettingController::class, 'updateTaxConfigurations']);
            Route::post('/tax-configurations/{tax}/activate', [SettingController::class, 'activateTax']);
            
            Route::apiResource('roles', RoleController::class);
            Route::prefix('roles')->group(function () {
                Route::get('/all',                 [RoleController::class, 'all']);
                Route::get('/{role}/permissions', [RoleController::class, 'permissions']);
                Route::post('/{role}/permissions', [RoleController::class, 'assignPermissions']);
                Route::get('/{role}/users',       [RoleController::class, 'users']);
            });
            
            Route::apiResource('permissions', PermissionController::class);
            Route::prefix('permissions')->group(function () {
                Route::get('/all',         [PermissionController::class, 'all']);
                Route::get('/grouped',     [PermissionController::class, 'grouped']);
                Route::get('/modules',     [PermissionController::class, 'modules']);
                Route::post('/bulk-create', [PermissionController::class, 'bulkCreate']);
                Route::get('/{permission}/roles', [PermissionController::class, 'roles']);
                Route::get('/{permission}/users', [PermissionController::class, 'users']);
            });
            
            Route::prefix('role-assignments')->group(function () {
                Route::get('/users',                        [RoleAssignmentController::class, 'getUsersWithRoles']);
                Route::get('/users/{user}',                  [RoleAssignmentController::class, 'getUserRoles']);
                Route::get('/users/{user}/permissions',     [RoleAssignmentController::class, 'getUserPermissions']);
                Route::post('/users/{user}/roles',           [RoleAssignmentController::class, 'assignRoles']);
                Route::post('/users/{user}/role',            [RoleAssignmentController::class, 'assignRole']);
                Route::delete('/users/{user}/roles/{role}',  [RoleAssignmentController::class, 'removeRole']);
                Route::get('/stats',                         [RoleAssignmentController::class, 'getRoleStats']);
                Route::post('/bulk-assign',                  [RoleAssignmentController::class, 'bulkAssignRoles']);
                Route::post('/bulk-remove',                  [RoleAssignmentController::class, 'bulkRemoveRoles']);
            });
            
            Route::prefix('notifications')->group(function () {
                Route::get('/',     [SettingController::class, 'notificationSettings']);
                Route::put('/',     [SettingController::class, 'updateNotificationSettings']);
                Route::post('/test',[SettingController::class, 'testNotification']);
            });
            
            Route::prefix('system')->group(function () {
                Route::get('/health',       [SettingController::class, 'systemHealth']);
                Route::get('/cache',        [SettingController::class, 'cacheInfo']);
                Route::post('/cache/clear', [SettingController::class, 'clearCache']);
            });

            Route::prefix('backups')->group(function () {
                Route::get('/',                        [BackupController::class, 'index']);
                Route::post('/',                       [BackupController::class, 'create']);
                Route::get('/{filename}/download',     [BackupController::class, 'download']);
                Route::post('/restore',                [BackupController::class, 'restore']);
                Route::delete('/{filename}',           [BackupController::class, 'destroy']);
                Route::get('/system-health',           [BackupController::class, 'systemHealth']);
                Route::post('/clear-cache',            [BackupController::class, 'clearCache']);
            });
        });
    });
});