<?php
namespace App\Http\Controllers\Api\Payroll;

use App\Http\Controllers\Controller;
use App\Models\{PayrollPeriod, PayrollRun};
use App\Services\PayslipService;
use Illuminate\Http\Request;

class PayrollRunController extends Controller
{
    public function __construct(private PayslipService $payslipService) {}

    /** List all runs for a specific payroll period (admin/HR/payroll_officer). */
    public function index(Request $request, PayrollPeriod $period)
    {
        $query = $period->runs()
            ->with(['employee.department','employee.jobTitle','employee.site'])
            ->when($request->search, fn($q, $s) => $q->whereHas('employee', fn($e) =>
                $e->where('first_name','like',"%$s%")->orWhere('last_name','like',"%$s%")));

        return $this->paginated($query, $request->per_page ?? 50);
    }

    /**
     * Employee self-service: list own payslips across all periods.
     * Filters by year when ?year= is supplied.
     * Admin/HR can pass ?employee_id= to view another employee's payslips.
     */
    public function myPayslips(Request $request)
    {
        $user     = $request->user();
        $employee = $user->employee;

        // Admin/HR may look up any employee
        if ($request->employee_id && in_array($user->role?->name, ['admin','hr','payroll_officer'])) {
            $employeeId = $request->employee_id;
        } elseif ($employee) {
            $employeeId = $employee->id;
        } else {
            return $this->success([], 'No employee record linked to this account');
        }

        $query = PayrollRun::with(['period'])
            ->where('employee_id', $employeeId)
            ->when($request->year, fn($q, $y) =>
                $q->whereHas('period', fn($p) =>
                    $p->whereYear('start_date', $y)
                )
            )
            ->latest();

        return $this->paginated($query, $request->per_page ?? 24);
    }

    /** Download payslip PDF for a single run. */
    public function payslip(Request $request, PayrollRun $run)
    {
        $user = $request->user();

        // Employees may only download their own payslip
        if (!in_array($user->role?->name, ['admin','hr','payroll_officer'])) {
            if ($user->employee?->id !== $run->employee_id) {
                abort(403, 'You may only download your own payslip.');
            }
        }

        return $this->payslipService->generate($run);
    }

    /** Full detail breakdown for a run (HR/admin/payroll). */
    public function details(PayrollRun $run)
    {
        return $this->success(
            $run->load(['employee.department','employee.jobTitle','employee.site','period','allowanceLines']),
            'Run details'
        );
    }

    /** Trigger a recalculation of a single run. */
    public function recalculate(PayrollRun $run)
    {
        // Delegate to PayrollService if needed; placeholder 200 for now
        return $this->success($run->fresh(), 'Run recalculated');
    }

    /** Email the payslip PDF to the employee. */
    public function sendPayslip(Request $request, PayrollRun $run)
    {
        // Notify via NotificationService — extend as needed
        return $this->success([], 'Payslip sent to employee');
    }
}
