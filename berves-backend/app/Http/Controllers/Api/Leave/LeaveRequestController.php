<?php
namespace App\Http\Controllers\Api\Leave;

use App\Http\Controllers\Controller;
use App\Models\{LeaveRequest, LeaveEntitlement, AuditLog};
use App\Services\LeaveService;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function __construct(private LeaveService $leaveService) {}

    public function index(Request $request)
    {
        $user  = auth()->user();
        $query = LeaveRequest::with(['employee','leaveType'])->latest();

        // Employees only see their own requests
        if ($user->role === 'employee' && $user->employee_id) {
            $query->where('employee_id', $user->employee_id);
        }

        $query->when($request->status,      fn($q, $s) => $q->where('status', $s))
              ->when($request->employee_id, fn($q, $id) => $q->where('employee_id', $id));

        return $this->paginated($query, $request->per_page ?? 15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date'    => 'required|date|after_or_equal:today',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'reason'        => 'nullable|string|max:1000',
        ]);

        $employeeId = auth()->user()->employee_id;
        if (!$employeeId) {
            return $this->error('No employee record linked to your account.', 422);
        }

        $validated['employee_id']    = $employeeId;
        $validated['days_requested'] = $this->leaveService->countWorkingDays(
            $validated['start_date'], $validated['end_date']
        );
        $validated['status'] = 'pending';

        $request = LeaveRequest::create($validated);
        return $this->success($request->load(['employee','leaveType']), 'Leave request submitted', 201);
    }

    public function show(LeaveRequest $request)
    {
        return $this->success($request->load(['employee','leaveType']));
    }

    public function review(Request $req, LeaveRequest $request)
    {
        $role = auth()->user()?->role;
        if (!in_array($role, ['admin','hr','manager'])) {
            return $this->error('Insufficient permissions to review leave.', 403);
        }

        $req->validate(['status' => 'required|in:approved,rejected']);

        $old = $request->toArray();
        $request->update([
            'status'         => $req->status,
            'reviewed_by'    => auth()->id(),
            'reviewed_at'    => now(),
            'review_comment' => $req->notes ?? $req->review_comment,
        ]);

        if ($req->status === 'approved') {
            $this->leaveService->deductEntitlement($request);
        }

        AuditLog::record('leave.reviewed', $request, $old, $request->fresh()->toArray());
        return $this->success($request->fresh()->load(['employee','leaveType']), 'Leave request '.$req->status);
    }

    public function approve(Request $req, LeaveRequest $request)
    {
        return $this->review(tap($req, fn($r) => $r->merge(['status' => 'approved'])), $request);
    }

    public function reject(Request $req, LeaveRequest $request)
    {
        return $this->review(tap($req, fn($r) => $r->merge(['status' => 'rejected'])), $request);
    }

    public function cancel(LeaveRequest $request)
    {
        $user = auth()->user();
        $isOwner = $user->employee_id === $request->employee_id;
        if (!$isOwner && !in_array($user->role, ['admin','hr'])) {
            return $this->error('You cannot cancel this request.', 403);
        }

        if (!in_array($request->status, ['pending'])) {
            return $this->error('Only pending requests can be cancelled.', 422);
        }

        $request->update(['status' => 'cancelled']);
        return $this->success(null, 'Leave request cancelled');
    }

    public function pending()
    {
        $query = LeaveRequest::with(['employee','leaveType'])->where('status','pending')->latest();
        return $this->paginated($query, 15);
    }

    public function byEmployee(Request $req, \App\Models\Employee $employee)
    {
        $query = LeaveRequest::with('leaveType')->where('employee_id', $employee->id)->latest();
        return $this->paginated($query, 15);
    }

    public function calendar(Request $req)
    {
        $start = $req->get('start', now()->startOfMonth()->toDateString());
        $end   = $req->get('end',   now()->endOfMonth()->toDateString());

        $requests = LeaveRequest::with(['employee','leaveType'])
            ->where('status','approved')
            ->whereBetween('start_date', [$start, $end])
            ->get();

        return $this->success($requests);
    }

    public function history(LeaveRequest $request)
    {
        $logs = AuditLog::where('model_type', LeaveRequest::class)
            ->where('model_id', $request->id)
            ->latest('created_at')
            ->get();
        return $this->success($logs);
    }
}
