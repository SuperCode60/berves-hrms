<?php
namespace App\Http\Controllers\Api\Payroll;

use App\Http\Controllers\Controller;
use App\Models\EmployeeLoan;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $query = EmployeeLoan::with(['employee','approvedBy'])
            ->when($request->employee_id, fn($q, $id) => $q->where('employee_id', $id))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest();
        return $this->paginated($query);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id'       => 'required|exists:employees,id',
            'principal'         => 'required|numeric|min:1',
            'interest_rate'     => 'nullable|numeric|min:0',
            'monthly_deduction' => 'required|numeric|min:1',
            'disbursed_on'      => 'required|date',
        ]);

        $loan = EmployeeLoan::create([
            ...$validated,
            'balance_remaining' => $validated['principal'],
            'approved_by'       => auth()->id(),
        ]);

        return $this->success($loan->load('employee'), 'Loan created', 201);
    }
}
