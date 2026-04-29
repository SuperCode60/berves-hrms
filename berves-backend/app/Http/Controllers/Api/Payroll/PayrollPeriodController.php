<?php
namespace App\Http\Controllers\Api\Payroll;

use App\Http\Controllers\Controller;
use App\Models\{PayrollPeriod, AuditLog};
use App\Services\PayrollService;
use Illuminate\Http\Request;

class PayrollPeriodController extends Controller
{
    public function __construct(private PayrollService $payrollService) {}

    public function index(Request $request)
    {
        $query = PayrollPeriod::with(['processedBy','approvedBy'])->latest();
        return $this->paginated($query, $request->per_page ?? 15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'period_name' => 'required|string|unique:payroll_periods',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after:start_date',
        ]);
        $period = PayrollPeriod::create($validated);
        AuditLog::record('payroll.period_created', $period);
        return $this->success($period, 'Payroll period created', 201);
    }

    public function show(PayrollPeriod $period)
    {
        return $this->success($period->load(['processedBy','approvedBy']));
    }

    public function update(Request $request, PayrollPeriod $period)
    {
        if ($period->status !== 'open') {
            return $this->error('Only open periods can be edited.', 422);
        }
        $validated = $request->validate([
            'period_name' => 'sometimes|string|unique:payroll_periods,period_name,'.$period->id,
            'start_date'  => 'sometimes|date',
            'end_date'    => 'sometimes|date|after:start_date',
        ]);
        $period->update($validated);
        return $this->success($period->fresh(), 'Period updated');
    }

    public function destroy(PayrollPeriod $period)
    {
        if ($period->status !== 'open') {
            return $this->error('Only open periods can be deleted.', 422);
        }
        $period->delete();
        return $this->success(null, 'Period deleted');
    }

    /* ── Run payroll ─────────────────────────────────────────── */
    public function run(PayrollPeriod $period)
    {
        if ($period->status !== 'open') {
            return $this->error('Only open periods can be run.', 422);
        }

        // Role check: only admin or payroll_officer
        $role = auth()->user()?->role;
        if (!in_array($role, ['admin', 'payroll_officer'])) {
            return $this->error('Insufficient permissions to run payroll.', 403);
        }

        $this->payrollService->runPayroll($period);
        AuditLog::record('payroll.run', $period);

        return $this->success($period->fresh(), 'Payroll processed successfully');
    }

    /* ── Approve ─────────────────────────────────────────────── */
    public function approve(PayrollPeriod $period)
    {
        if ($period->status !== 'processing') {
            return $this->error('Only processing periods can be approved.', 422);
        }

        $role = auth()->user()?->role;
        if (!in_array($role, ['admin', 'hr', 'payroll_officer'])) {
            return $this->error('Insufficient permissions to approve payroll.', 403);
        }

        $period->update([
            'status'      => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        AuditLog::record('payroll.approved', $period);
        return $this->success($period->fresh(), 'Payroll approved');
    }

    /* ── Reject ──────────────────────────────────────────────── */
    public function reject(PayrollPeriod $period)
    {
        if ($period->status !== 'processing') {
            return $this->error('Only processing periods can be rejected.', 422);
        }

        $period->update(['status' => 'open']);
        AuditLog::record('payroll.rejected', $period);
        return $this->success($period->fresh(), 'Payroll rejected, returned to open');
    }

    /* ── Lock ────────────────────────────────────────────────── */
    public function lock(PayrollPeriod $period)
    {
        if ($period->status !== 'approved') {
            return $this->error('Only approved periods can be locked.', 422);
        }

        $period->update(['status' => 'locked']);
        AuditLog::record('payroll.locked', $period);
        return $this->success($period->fresh(), 'Payroll locked');
    }

    /* ── Summary ─────────────────────────────────────────────── */
    public function summary(PayrollPeriod $period)
    {
        $runs = $period->runs()->with('employee')->get();
        return $this->success([
            'period'           => $period,
            'employee_count'   => $runs->count(),
            'total_gross'      => $runs->sum('gross_pay'),
            'total_deductions' => $runs->sum('total_deductions'),
            'total_net'        => $runs->sum('net_pay'),
        ]);
    }
}
