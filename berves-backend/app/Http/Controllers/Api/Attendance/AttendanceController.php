<?php
namespace App\Http\Controllers\Api\Attendance;

use App\Http\Controllers\Controller;
use App\Models\{AttendanceRecord, Employee, AuditLog};
use App\Services\AttendanceService;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function __construct(private AttendanceService $attendanceService) {}

    public function index(Request $request)
    {
        $user  = auth()->user();
        $query = AttendanceRecord::with(['employee','site'])
            ->when($request->date,        fn($q, $d) => $q->whereDate('check_in_at', $d))
            ->when($request->employee_id, fn($q, $id) => $q->where('employee_id', $id))
            ->when($request->search, fn($q, $s) => $q->whereHas('employee', fn($e) =>
                $e->where('first_name','like',"%$s%")->orWhere('last_name','like',"%$s%")
            ))
            ->latest('check_in_at');

        return $this->paginated($query, $request->per_page ?? 50);
    }

    public function myAttendance(Request $request)
    {
        $employeeId = auth()->user()->employee_id;
        if (!$employeeId) return $this->error('No employee record linked.', 422);

        $query = AttendanceRecord::with('site')
            ->where('employee_id', $employeeId)
            ->when($request->date, fn($q, $d) => $q->whereDate('check_in_at', $d))
            ->latest('check_in_at');

        return $this->paginated($query, $request->per_page ?? 30);
    }

    public function show(AttendanceRecord $attendance)
    {
        return $this->success($attendance->load(['employee','site']));
    }

    public function checkIn(Request $request)
    {
        $request->validate([
            'latitude'  => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $employeeId = auth()->user()->employee_id;
        if (!$employeeId) return $this->error('No employee record linked to your account.', 422);

        $employee = Employee::findOrFail($employeeId);

        try {
            $record = $this->attendanceService->checkIn($employee, $request->all());
            AuditLog::record('attendance.check_in', $record);
            return $this->success($record->load('site'), 'Checked in successfully', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function checkOut(Request $request)
    {
        $request->validate([
            'latitude'  => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $employeeId = auth()->user()->employee_id;
        if (!$employeeId) return $this->error('No employee record linked.', 422);

        $employee = Employee::findOrFail($employeeId);

        try {
            $record = $this->attendanceService->checkOut($employee, $request->all());
            AuditLog::record('attendance.check_out', $record);
            return $this->success($record, 'Checked out successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function adjust(Request $request, AttendanceRecord $attendance)
    {
        $role = auth()->user()?->role;
        if (!in_array($role, ['admin','hr','manager'])) {
            return $this->error('Insufficient permissions.', 403);
        }

        $request->validate([
            'check_in_at'  => 'sometimes|date',
            'check_out_at' => 'sometimes|date|after:check_in_at',
            'notes'        => 'sometimes|string',
        ]);

        $attendance->update($request->only(['check_in_at','check_out_at','notes']));

        if ($attendance->check_out_at) {
            $attendance->update([
                'total_hours' => round(
                    \Carbon\Carbon::parse($attendance->check_in_at)
                        ->diffInMinutes($attendance->check_out_at) / 60, 2
                ),
            ]);
        }

        AuditLog::record('attendance.adjusted', $attendance);
        return $this->success($attendance->fresh(), 'Attendance adjusted');
    }

    public function byDate(Request $request)
    {
        $date  = $request->get('date', today()->toDateString());
        $query = AttendanceRecord::with(['employee','site'])->whereDate('check_in_at', $date);
        return $this->paginated($query, 100);
    }

    public function byEmployee(Request $request, Employee $employee)
    {
        $query = AttendanceRecord::with('site')
            ->where('employee_id', $employee->id)
            ->when($request->month, fn($q, $m) => $q->whereYear('check_in_at', substr($m,0,4))->whereMonth('check_in_at', substr($m,5,2)))
            ->latest('check_in_at');
        return $this->paginated($query, 31);
    }

    public function lateArrivals(Request $request)
    {
        $date  = $request->get('date', today()->toDateString());
        $query = AttendanceRecord::with(['employee','site'])
            ->whereDate('check_in_at', $date)
            ->where('late_minutes', '>', 0)
            ->orderByDesc('late_minutes');
        return $this->success($query->get());
    }

    public function absentToday()
    {
        $presentIds = AttendanceRecord::whereDate('check_in_at', today())->pluck('employee_id');
        $absent     = Employee::active()->whereNotIn('id', $presentIds)->with(['department','site'])->get();
        return $this->success($absent);
    }

    public function summary(Request $request)
    {
        $month   = $request->get('month', now()->format('Y-m'));
        $date    = \Carbon\Carbon::parse($month);
        $total   = Employee::active()->count();
        $present = AttendanceRecord::whereYear('check_in_at', $date->year)
            ->whereMonth('check_in_at', $date->month)->count();

        return $this->success([
            'total_employees' => $total,
            'total_records'   => $present,
            'avg_daily'       => $date->daysInMonth > 0 ? round($present / $date->daysInMonth, 1) : 0,
        ]);
    }

    public function bulkCheckIn(Request $request)
    {
        $role = auth()->user()?->role;
        if (!in_array($role, ['admin','hr'])) {
            return $this->error('Insufficient permissions.', 403);
        }

        $request->validate(['employee_ids' => 'required|array', 'employee_ids.*' => 'exists:employees,id']);
        $results = [];
        foreach ($request->employee_ids as $empId) {
            try {
                $emp       = Employee::find($empId);
                $record    = $this->attendanceService->checkIn($emp, []);
                $results[] = ['employee_id' => $empId, 'status' => 'ok', 'record_id' => $record->id];
            } catch (\Exception $e) {
                $results[] = ['employee_id' => $empId, 'status' => 'error', 'message' => $e->getMessage()];
            }
        }
        return $this->success($results, 'Bulk check-in completed');
    }
}
