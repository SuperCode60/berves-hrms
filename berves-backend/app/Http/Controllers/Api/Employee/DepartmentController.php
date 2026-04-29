<?php
namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        return $this->success(Department::with(['manager','site'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|unique:departments',
            'site_id'    => 'nullable|exists:sites,id',
            'manager_id' => 'nullable|exists:employees,id',
        ]);
        return $this->success(Department::create($validated)->load(['manager','site']), 'Department created', 201);
    }

    public function show(Department $department)
    {
        return $this->success($department->load(['manager','site']));
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name'       => 'sometimes|string|unique:departments,name,'.$department->id,
            'site_id'    => 'nullable|exists:sites,id',
            'manager_id' => 'nullable|exists:employees,id',
        ]);
        $department->update($validated);
        return $this->success($department->fresh()->load(['manager','site']), 'Department updated');
    }

    public function destroy(Department $department)
    {
        if ($department->employees()->exists()) {
            return $this->error('Cannot delete a department that still has employees.', 422);
        }
        $department->delete();
        return $this->success(null, 'Department deleted');
    }

    public function employees(Department $department)
    {
        $employees = $department->employees()
            ->with(['jobTitle', 'site'])
            ->orderBy('first_name')
            ->get();
        return $this->success($employees);
    }

    public function assignEmployees(Request $request, Department $department)
    {
        $validated = $request->validate([
            'employee_ids'   => 'required|array',
            'employee_ids.*' => 'exists:employees,id',
        ]);
        \App\Models\Employee::whereIn('id', $validated['employee_ids'])
            ->update(['department_id' => $department->id]);
        return $this->success(null, 'Employees assigned to department');
    }

    public function tree()
    {
        $depts = Department::with(['manager', 'site'])->get();
        return $this->success($depts);
    }
}
