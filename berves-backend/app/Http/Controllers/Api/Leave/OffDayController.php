<?php
namespace App\Http\Controllers\Api\Leave;

use App\Http\Controllers\Controller;
use App\Models\{OffDayRequest, ShiftSchedule};
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;

class OffDayController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = OffDayRequest::with(['employee','reviewer'])
            ->when($user->role === 'employee', fn($q) => $q->where('employee_id', $user->employee_id))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->search, fn($q, $s) => $q->whereHas('employee', fn($q2) =>
                $q2->where('first_name', 'like', "%$s%")
                   ->orWhere('last_name',  'like', "%$s%")
                   ->orWhere('employee_number', 'like', "%$s%")
            ))
            ->latest();
        return $this->paginated($query, $request->per_page ?? 15);
    }

    public function destroy(OffDayRequest $offDay)
    {
        $user = auth()->user();
        // Employees can only cancel their own pending requests
        if ($user->role === 'employee' && $offDay->employee_id !== $user->employee_id) {
            return $this->error('Unauthorized.', 403);
        }
        if ($offDay->status !== 'pending') {
            return $this->error('Only pending requests can be cancelled.', 422);
        }
        $offDay->delete();
        return $this->success(null, 'Off-day request cancelled');
    }

    public function store(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'reason'     => 'nullable|string',
        ]);

        $employee = auth()->user()->employee;
        if (!$employee) return $this->error('Employee profile not found', 404);

        $period    = CarbonPeriod::create($request->start_date, $request->end_date);
        $days      = iterator_to_array($period);
        $daysCount = count($days);

        // Check for a schedule conflict on any day in the range
        $conflict = ShiftSchedule::where('employee_id', $employee->id)
            ->whereBetween('schedule_date', [$request->start_date, $request->end_date])
            ->exists();

        $offDay = OffDayRequest::create([
            'employee_id'          => $employee->id,
            'start_date'           => $request->start_date,
            'end_date'             => $request->end_date,
            'days_count'           => $daysCount,
            'reason'               => $request->reason,
            'has_schedule_conflict'=> $conflict,
        ]);

        return $this->success(
            $offDay->load('employee'),
            $daysCount === 1 ? 'Off-day request submitted' : "{$daysCount}-day off request submitted",
            201
        );
    }

    public function review(Request $request, OffDayRequest $offDay)
    {
        $request->validate(['status' => 'required|in:approved,rejected']);
        $offDay->update(['status' => $request->status, 'reviewed_by' => auth()->id(), 'reviewed_at' => now()]);
        return $this->success($offDay->fresh(), 'Review recorded');
    }

    public function approve(Request $request, OffDayRequest $offDay)
    {
        return $this->review(tap($request, fn($r) => $r->merge(['status' => 'approved'])), $offDay);
    }

    public function reject(Request $request, OffDayRequest $offDay)
    {
        return $this->review(tap($request, fn($r) => $r->merge(['status' => 'rejected'])), $offDay);
    }
}
