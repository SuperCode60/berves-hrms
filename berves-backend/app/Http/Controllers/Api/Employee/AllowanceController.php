<?php
namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Models\{Employee, EmployeeAllowance};
use Illuminate\Http\Request;

class AllowanceController extends Controller
{
    public function index(Employee $employee)
    {
        return $this->success($employee->allowances()->get());
    }

    public function store(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'allowance_type' => 'required|string',
            'amount'         => 'required|numeric|min:0',
            'is_taxable'     => 'boolean',
            'effective_from' => 'required|date',
            'effective_to'   => 'nullable|date|after:effective_from',
        ]);
        $allowance = $employee->allowances()->create($validated);
        return $this->success($allowance, 'Allowance added', 201);
    }
}
