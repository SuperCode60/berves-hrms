<?php
namespace App\Http\Controllers\Api\Payroll;

use App\Http\Controllers\Controller;
use App\Models\{OvertimeRecord, Employee};
use App\Services\PayrollService;
use Illuminate\Http\Request;

class OvertimeController extends Controller
{
    public function __construct(private PayrollService $payrollService) {}

    public function index(Request $request)
    {
        $query = OvertimeRecord::with(['employee','approvedBy'])
            ->when($request->employee_id, fn($q, $id) => $q->where('employee_id', $id))
            ->when($request->approved, fn($q) => $q->whereNotNull('approved_by'))
            ->latest('date');
        return $this->paginated($query);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date'        => 'required|date',
            'day_type'    => 'required|in:weekday,sunday,public_holiday',
            'hours'       => 'required|numeric|min:0.5|max:12',
        ]);

        $employee   = Employee::findOrFail($validated['employee_id']);
        $amount     = $this->payrollService->computeOvertimeAmount($employee, $validated['day_type'], $validated['hours']);
        $policy     = \App\Models\OvertimePolicy::where('day_type', $validated['day_type'])->first();
        $multiplier = $policy?->multiplier ?? ($validated['day_type'] === 'sunday' ? 2.0 : 1.5);

        $record = OvertimeRecord::create([
            ...$validated,
            'hourly_rate'     => $employee->base_salary / 160,
            'rate_multiplier' => $multiplier,
            'amount'          => $amount,
            'approved_by'     => auth()->id(),
        ]);

        return $this->success($record->load('employee'), 'Overtime recorded', 201);
    }

    public function approve(OvertimeRecord $overtime)
    {
        $overtime->update(['approved_by' => auth()->id()]);
        return $this->success($overtime, 'Overtime approved');
    }
}
