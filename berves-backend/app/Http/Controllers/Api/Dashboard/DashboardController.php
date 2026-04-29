<?php
namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\{Employee, AttendanceRecord, LeaveRequest, OffDayRequest, PayrollPeriod};
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = Carbon::today();

        $presentToday = AttendanceRecord::whereDate('check_in_at', $today)->count();
        $totalActive  = Employee::where('employment_status', 'active')->count();

        $stats = [
            'total_employees'    => $totalActive,
            'present_today'      => $presentToday,
            'absent_today'       => max(0, $totalActive - $presentToday),
            'late_today'         => AttendanceRecord::whereDate('check_in_at', $today)->where('late_minutes', '>', 0)->count(),
            'pending_leave'      => LeaveRequest::where('status', 'pending')->count(),
            'employee_change'    => $this->employeeGrowth(),
            'by_department'      => Employee::selectRaw('departments.name, COUNT(*) as count')
                ->join('departments', 'departments.id', '=', 'employees.department_id')
                ->where('employment_status', 'active')
                ->groupBy('departments.name')
                ->get(),
            'pending_approvals'  => LeaveRequest::with(['employee', 'leaveType'])
                ->where('status', 'pending')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($r) => [
                    'employee_name' => $r->employee?->first_name . ' ' . $r->employee?->last_name,
                    'type'          => 'Leave: ' . ($r->leaveType?->name ?? 'Unknown'),
                    'status'        => $r->status,
                    'created_at'    => $r->created_at,
                ]),
            'expiring_certs_count' => 0,
            'expiring_certs' => [],
        ];

        $period = PayrollPeriod::whereMonth('start_date', now()->month)->first();
        if ($period) {
            $stats['payroll_total'] = $period->runs()->sum('net_pay') ?? 0;
        } else {
            $stats['payroll_total'] = 0;
        }

        return $this->success($stats);
    }

    public function attendanceChart()
    {
        try {
            $days = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $present = AttendanceRecord::whereDate('check_in_at', $date)->count();
                $total = Employee::where('employment_status', 'active')->count();
                
                $late = AttendanceRecord::whereDate('check_in_at', $date)->where('late_minutes', '>', 0)->count();
                $days[] = [
                    'day'     => $date->format('D'),
                    'date'    => $date->format('Y-m-d'),
                    'present' => $present,
                    'late'    => $late,
                    'absent'  => max(0, $total - $present),
                ];
            }
            return $this->success($days);
        } catch (\Exception $e) {
            \Log::error('Attendance chart error: ' . $e->getMessage());
            return $this->success([]);
        }
    }

    public function activity()
    {
        try {
            $activities = LeaveRequest::with('employee')
                ->latest()
                ->take(10)
                ->get()
                ->map(function($leave) {
                    return [
                        'id' => $leave->id,
                        'user' => $leave->employee?->first_name . ' ' . $leave->employee?->last_name ?? 'Unknown',
                        'action' => "Leave request: {$leave->status} - {$leave->leaveType?->name}",
                        'timestamp' => $leave->created_at->diffForHumans(),
                        'created_at' => $leave->created_at,
                    ];
                });
            
            return $this->success($activities);
        } catch (\Exception $e) {
            \Log::error('Activity error: ' . $e->getMessage());
            return $this->success([]);
        }
    }

    public function upcomingEvents()
    {
        try {
            $events = [];
            
            // Get pending leaves as events
            $pendingLeaves = LeaveRequest::with('employee')
                ->where('status', 'pending')
                ->whereDate('start_date', '>=', Carbon::today())
                ->take(5)
                ->get()
                ->map(function($leave) {
                    return [
                        'title' => "Leave Request: {$leave->employee?->first_name} {$leave->employee?->last_name}",
                        'date' => $leave->start_date->format('Y-m-d'),
                        'type' => 'pending_leave',
                        'description' => "{$leave->leaveType?->name} - " . substr($leave->reason ?? 'No reason provided', 0, 50),
                    ];
                });
            
            $events = array_merge($events, $pendingLeaves->toArray());
            
            return $this->success($events);
        } catch (\Exception $e) {
            \Log::error('Upcoming events error: ' . $e->getMessage());
            return $this->success([]);
        }
    }

    public function recentEmployees()
    {
        try {
            $recentEmployees = Employee::with('department')
                ->where('employment_status', 'active')
                ->latest('hire_date')
                ->take(5)
                ->get()
                ->map(function($employee) {
                    return [
                        'id' => $employee->id,
                        'name' => $employee->first_name . ' ' . $employee->last_name,
                        'email' => $employee->email,
                        'department' => $employee->department?->name,
                        'hire_date' => $employee->hire_date?->format('Y-m-d'),
                        'profile_photo' => $employee->profile_photo ?? null,
                    ];
                });
            
            return $this->success($recentEmployees);
        } catch (\Exception $e) {
            \Log::error('Recent employees error: ' . $e->getMessage());
            return $this->success([]);
        }
    }

    public function hrStats()
    {
        $today = Carbon::today();
        $in30  = $today->copy()->addDays(30);

        $contractsExpiring = Employee::where('employment_type', 'contract')
            ->whereNotNull('contract_end_date')
            ->whereBetween('contract_end_date', [$today, $in30])
            ->with(['department'])
            ->orderBy('contract_end_date')
            ->get()
            ->map(fn($e) => [
                'id'             => $e->id,
                'name'           => $e->first_name . ' ' . $e->last_name,
                'department'     => $e->department?->name,
                'contract_end'   => $e->contract_end_date?->format('Y-m-d'),
                'days_remaining' => $today->diffInDays($e->contract_end_date, false),
            ]);

        $probationEnding = Employee::whereNotNull('probation_end_date')
            ->whereBetween('probation_end_date', [$today, $in30])
            ->with(['department'])
            ->orderBy('probation_end_date')
            ->get()
            ->map(fn($e) => [
                'id'             => $e->id,
                'name'           => $e->first_name . ' ' . $e->last_name,
                'department'     => $e->department?->name,
                'probation_end'  => $e->probation_end_date?->format('Y-m-d'),
                'days_remaining' => $today->diffInDays($e->probation_end_date, false),
            ]);

        return $this->success([
            'active_employees'    => Employee::where('employment_status', 'active')->count(),
            'on_leave_today'      => LeaveRequest::where('status', 'approved')
                ->whereDate('start_date', '<=', $today)->whereDate('end_date', '>=', $today)->count(),
            'new_this_month'      => Employee::whereMonth('hire_date', now()->month)->whereYear('hire_date', now()->year)->count(),
            'contracts_expiring'  => $contractsExpiring->count(),
            'probation_ending'    => $probationEnding->count(),
            'by_employment_type'  => Employee::where('employment_status', 'active')
                ->selectRaw('employment_type as name, COUNT(*) as count')
                ->groupBy('employment_type')->get(),
            'by_status'           => Employee::selectRaw('employment_status as name, COUNT(*) as count')
                ->groupBy('employment_status')->get(),
            'by_department'       => Employee::where('employment_status', 'active')
                ->selectRaw('departments.name, COUNT(*) as count')
                ->join('departments', 'departments.id', '=', 'employees.department_id')
                ->groupBy('departments.name')->orderByDesc('count')->get(),
            'contracts_expiring_list' => $contractsExpiring,
            'probation_ending_list'   => $probationEnding,
            'recent_hires'        => Employee::with(['department', 'jobTitle'])
                ->latest('hire_date')->take(6)->get()
                ->map(fn($e) => [
                    'id'         => $e->id,
                    'name'       => $e->first_name . ' ' . $e->last_name,
                    'department' => $e->department?->name,
                    'job_title'  => $e->jobTitle?->title,
                    'hire_date'  => $e->hire_date?->format('Y-m-d'),
                    'photo'      => $e->profile_photo,
                    'status'     => $e->employment_status,
                ]),
        ]);
    }

    public function leaveTrend()
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date     = Carbon::now()->subMonths($i);
            $base     = LeaveRequest::whereYear('created_at', $date->year)->whereMonth('created_at', $date->month);
            $months[] = [
                'month'    => $date->format('M'),
                'approved' => (clone $base)->where('status', 'approved')->count(),
                'pending'  => (clone $base)->where('status', 'pending')->count(),
                'rejected' => (clone $base)->where('status', 'rejected')->count(),
            ];
        }
        return $this->success($months);
    }

    private function employeeGrowth(): float
    {
        try {
            $thisMonth = Employee::whereMonth('hire_date', now()->month)
                ->whereYear('hire_date', now()->year)
                ->count();
            $lastMonth = Employee::whereMonth('hire_date', now()->subMonth()->month)
                ->whereYear('hire_date', now()->subMonth()->year)
                ->count();
            if ($lastMonth === 0) return 0;
            return round(($thisMonth - $lastMonth) / $lastMonth * 100, 1);
        } catch (\Exception $e) {
            return 0;
        }
    }
}