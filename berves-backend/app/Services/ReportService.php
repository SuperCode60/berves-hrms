<?php
namespace App\Services;

use App\Models\{PayrollRun, AttendanceRecord, LeaveRequest, Employee, OvertimeRecord};
use Carbon\Carbon;

class ReportService
{
    /* ── Payroll ─────────────────────────────────────────────────────── */
    public function payrollSummary(string $month): array
    {
        $date = Carbon::parse($month);
        $runs = PayrollRun::with(['employee.department','employee.jobTitle'])
            ->whereHas('period', fn($q) => $q->whereYear('start_date', $date->year)
                ->whereMonth('start_date', $date->month))
            ->get();

        $byDepartment = $runs
            ->groupBy(fn($r) => $r->employee->department?->name ?? 'Unassigned')
            ->map(fn($group, $name) => [
                'name'        => $name,
                'count'       => $group->count(),
                'gross_pay'   => $group->sum('gross_pay'),
                'deductions'  => $group->sum('total_deductions'),
                'net_pay'     => $group->sum('net_pay'),
            ])->values();

        $runsDetail = $runs->map(fn($r) => [
            'name'             => $r->employee->first_name.' '.$r->employee->last_name,
            'employee_number'  => $r->employee->employee_number,
            'department'       => $r->employee->department?->name ?? '—',
            'basic_salary'     => $r->basic_salary,
            'total_allowances' => $r->total_allowances,
            'overtime_pay'     => $r->overtime_pay,
            'gross_pay'        => $r->gross_pay,
            'total_deductions' => $r->total_deductions,
            'net_pay'          => $r->net_pay,
            'payment_status'   => $r->payment_status,
        ])->values();

        return [
            'total_gross'      => $runs->sum('gross_pay'),
            'total_deductions' => $runs->sum('total_deductions'),
            'total_net'        => $runs->sum('net_pay'),
            'employee_count'   => $runs->count(),
            'by_department'    => $byDepartment,
            'runs'             => $runsDetail,
        ];
    }

    /* ── Attendance ──────────────────────────────────────────────────── */
    public function attendanceSummary(string $month): array
    {
        $date  = Carbon::parse($month);
        $start = $date->copy()->startOfMonth();
        $end   = $date->copy()->endOfMonth();

        $totalActive = Employee::where('employment_status', 'active')->count();
        $trend       = collect();
        $totalLate   = 0;
        $presentSum  = 0;
        $days        = 0;

        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            if ($d->isWeekday()) {
                $present = AttendanceRecord::whereDate('check_in_at', $d)->count();
                $late    = AttendanceRecord::whereDate('check_in_at', $d)
                    ->where('is_late', true)->count();
                $rate    = $totalActive > 0 ? round($present / $totalActive * 100, 1) : 0;
                $trend->push([
                    'date'    => $d->format('d M'),
                    'present' => $present,
                    'absent'  => max(0, $totalActive - $present),
                    'late'    => $late,
                    'rate'    => $rate,
                ]);
                $totalLate  += $late;
                $presentSum += $present;
                $days++;
            }
        }

        // By department
        $byDepartment = Employee::with('department')
            ->where('employment_status', 'active')
            ->get()
            ->groupBy(fn($e) => $e->department?->name ?? 'Unassigned')
            ->map(function ($employees, $name) use ($start, $end) {
                $ids     = $employees->pluck('id');
                $records = AttendanceRecord::whereIn('employee_id', $ids)
                    ->whereBetween('check_in_at', [$start, $end])->count();
                $workingDays = $start->diffInWeekdays($end) + 1;
                $total       = $employees->count() * $workingDays;
                return [
                    'name'    => $name,
                    'total'   => $total,
                    'present' => $records,
                    'absent'  => max(0, $total - $records),
                    'rate'    => $total > 0 ? round($records / $total * 100, 1) : 0,
                ];
            })->values();

        return [
            'trend'        => $trend,
            'by_department'=> $byDepartment,
            'working_days' => $days,
            'total_late'   => $totalLate,
            'avg_rate'     => $days > 0 && $totalActive > 0
                ? round($presentSum / ($days * $totalActive) * 100, 1) : 0,
        ];
    }

    /* ── Leave ───────────────────────────────────────────────────────── */
    public function leaveReport(string $month): array
    {
        $date     = Carbon::parse($month);
        $requests = LeaveRequest::with(['leaveType', 'employee.department'])
            ->whereIn('status', ['approved','pending'])
            ->whereYear('start_date', $date->year)
            ->whereMonth('start_date', $date->month)
            ->get();

        $byType = $requests->groupBy(fn($r) => $r->leaveType?->name ?? 'Other')
            ->map(fn($g, $name) => [
                'type'  => $name,
                'days'  => $g->sum('days_requested'),
                'count' => $g->count(),
            ])->values();

        $detail = $requests->map(fn($r) => [
            'employee'   => $r->employee->first_name.' '.$r->employee->last_name,
            'department' => $r->employee->department?->name ?? '—',
            'type'       => $r->leaveType?->name ?? '—',
            'start_date' => $r->start_date?->format('d M Y') ?? '—',
            'end_date'   => $r->end_date?->format('d M Y') ?? '—',
            'days'       => $r->days_requested,
            'status'     => $r->status,
        ])->values();

        return [
            'by_type'        => $byType,
            'detail'         => $detail,
            'total_days'     => $requests->sum('days_requested'),
            'total_requests' => $requests->count(),
        ];
    }

    /* ── Overtime ────────────────────────────────────────────────────── */
    public function overtimeReport(string $month): array
    {
        $date    = Carbon::parse($month);
        $records = OvertimeRecord::with(['employee.department', 'approvedBy'])
            ->whereYear('date', $date->year)
            ->whereMonth('date', $date->month)
            ->orderBy('date')
            ->get();

        $mapped = $records->map(fn($r) => [
            'employee'        => $r->employee->first_name.' '.$r->employee->last_name,
            'employee_number' => $r->employee->employee_number,
            'department'      => $r->employee->department?->name ?? '—',
            'date'            => $r->date?->format('d M Y') ?? '—',
            'day_type'        => $r->day_type,
            'hours'           => $r->hours,
            'rate_multiplier' => $r->rate_multiplier,
            'amount'          => $r->amount,
            'approved_by'     => $r->approved_by,
        ])->values();

        return [
            'records'       => $mapped,
            'total_records' => $records->count(),
            'total_hours'   => $records->sum('hours'),
            'total_amount'  => $records->sum('amount'),
        ];
    }

    /* ── Headcount ───────────────────────────────────────────────────── */
    public function headcountReport(): array
    {
        $total      = Employee::count();
        $active     = Employee::where('employment_status','active')->count();
        $byStatus   = Employee::selectRaw('employment_status, count(*) as count')
            ->groupBy('employment_status')->pluck('count','employment_status');
        $byDept     = Employee::with('department')
            ->selectRaw('department_id, count(*) as count')
            ->where('employment_status','active')
            ->groupBy('department_id')
            ->with('department')
            ->get()
            ->map(fn($e) => ['name' => $e->department?->name ?? 'Unassigned', 'count' => $e->count]);
        $bySite     = Employee::with('site')
            ->selectRaw('site_id, count(*) as count')
            ->where('employment_status','active')
            ->groupBy('site_id')
            ->get()
            ->map(fn($e) => ['name' => $e->site?->name ?? 'Unassigned', 'count' => $e->count]);

        return [
            'total'       => $total,
            'active'      => $active,
            'by_status'   => $byStatus,
            'by_dept'     => $byDept,
            'by_site'     => $bySite,
        ];
    }
}
