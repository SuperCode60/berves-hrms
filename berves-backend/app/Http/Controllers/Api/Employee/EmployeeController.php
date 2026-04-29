<?php
namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Models\{Employee, AuditLog};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    /* ── Guard helper ────────────────────────────────────────── */
    private function requireHrOrAdmin(): bool
    {
        return in_array(auth()->user()?->role, ['admin', 'hr']);
    }

    /* ── Index ───────────────────────────────────────────────── */
    public function index(Request $request)
    {
        $user  = auth()->user();
        $query = Employee::with(['department','jobTitle','site','manager'])
            ->when($request->search, fn($q, $s) => $q->where(fn($q2) =>
                $q2->where('first_name','like',"%$s%")
                   ->orWhere('last_name','like',"%$s%")
                   ->orWhere('employee_number','like',"%$s%")
                   ->orWhere('email','like',"%$s%")
            ))
            ->when($request->status,        fn($q, $s) => $q->where('employment_status', $s))
            ->when($request->type,          fn($q, $t) => $q->where('employment_type', $t))
            ->when($request->department_id, fn($q, $d) => $q->where('department_id', $d))
            ->when($request->site_id,       fn($q, $s) => $q->where('site_id', $s))
            ->latest();

        // Managers only see their team unless HR/admin
        if ($user->role === 'manager') {
            $empId = $user->employee_id;
            $query->where(fn($q) => $q->where('manager_id', $empId)->orWhere('id', $empId));
        }

        return $this->paginated($query, $request->per_page ?? 15);
    }

    /* ── Store ───────────────────────────────────────────────── */
    public function store(Request $request)
    {
        if (!$this->requireHrOrAdmin()) {
            return $this->error('Insufficient permissions.', 403);
        }

        $validated = $request->validate([
            'first_name'              => 'required|string|max:100',
            'last_name'               => 'required|string|max:100',
            'phone'                   => 'required|string',
            'email'                   => 'nullable|email|unique:employees,email',
            'date_of_birth'           => 'nullable|date',
            'gender'                  => 'nullable|in:male,female,other',
            'national_id'             => 'nullable|string',
            'tin_number'              => 'nullable|string',
            'ssnit_number'            => 'nullable|string',
            'department_id'           => 'required|exists:departments,id',
            'job_title_id'            => 'required|exists:job_titles,id',
            'site_id'                 => 'required|exists:sites,id',
            'employment_type'         => 'required|in:permanent,contract,site_based',
            'hire_date'               => 'required|date',
            'base_salary'             => 'required|numeric|min:0',
            'bank_name'               => 'nullable|string',
            'bank_account'            => 'nullable|string',
            'bank_branch'             => 'nullable|string',
            'address'                 => 'nullable|string',
            'emergency_contact_name'  => 'nullable|string',
            'emergency_contact_phone' => 'nullable|string',
        ]);

        $validated['employee_number'] = Employee::generateNumber();
        $employee = Employee::create($validated);

        AuditLog::record('employee.created', $employee, [], $employee->toArray());

        return $this->success($employee->load(['department','jobTitle','site']), 'Employee created', 201);
    }

    /* ── Show ────────────────────────────────────────────────── */
    public function show(Employee $employee)
    {
        return $this->success($employee->load(['department','jobTitle','site','manager']));
    }

    /* ── Update ──────────────────────────────────────────────── */
    public function update(Request $request, Employee $employee)
    {
        if (!$this->requireHrOrAdmin()) {
            return $this->error('Insufficient permissions.', 403);
        }

        $old       = $employee->toArray();
        $validated = $request->validate([
            'first_name'        => 'sometimes|string|max:100',
            'last_name'         => 'sometimes|string|max:100',
            'phone'             => 'sometimes|string',
            'email'             => 'nullable|email|unique:employees,email,'.$employee->id,
            'department_id'     => 'sometimes|exists:departments,id',
            'job_title_id'      => 'sometimes|exists:job_titles,id',
            'site_id'           => 'sometimes|exists:sites,id',
            'employment_status' => 'sometimes|in:active,on_leave,terminated,suspended',
            'employment_type'   => 'sometimes|in:permanent,contract,site_based',
            'base_salary'       => 'sometimes|numeric|min:0',
            'bank_name'         => 'nullable|string',
            'bank_account'      => 'nullable|string',
            'bank_branch'       => 'nullable|string',
            'address'           => 'nullable|string',
        ]);

        $employee->update($validated);
        AuditLog::record('employee.updated', $employee, $old, $employee->fresh()->toArray());

        return $this->success($employee->load(['department','jobTitle','site']), 'Employee updated');
    }

    /* ── Delete (soft) ───────────────────────────────────────── */
    public function destroy(Employee $employee)
    {
        if (!$this->requireHrOrAdmin()) {
            return $this->error('Insufficient permissions.', 403);
        }

        AuditLog::record('employee.deleted', $employee);
        $employee->delete();
        return $this->success(null, 'Employee archived');
    }

    /* ── Status actions ──────────────────────────────────────── */
    public function activate(Employee $employee)
    {
        $employee->update(['employment_status' => 'active']);
        AuditLog::record('employee.activated', $employee);
        return $this->success($employee->fresh(), 'Employee activated');
    }

    public function deactivate(Employee $employee)
    {
        $employee->update(['employment_status' => 'terminated']);
        AuditLog::record('employee.deactivated', $employee);
        return $this->success($employee->fresh(), 'Employee deactivated');
    }

    /* ── Assign manager ─────────────────────────────────────────── */
    public function assignManager(Request $request, Employee $employee)
    {
        if (!$this->requireHrOrAdmin()) {
            return $this->error('Insufficient permissions.', 403);
        }

        $validated = $request->validate([
            'manager_id' => 'nullable|exists:employees,id',
        ]);

        if (!empty($validated['manager_id']) && $validated['manager_id'] == $employee->id) {
            return $this->error('An employee cannot be their own manager.', 422);
        }

        $old = $employee->toArray();
        $employee->update(['manager_id' => $validated['manager_id'] ?: null]);
        AuditLog::record('employee.manager_assigned', $employee, $old, $employee->fresh()->toArray());

        return $this->success($employee->load(['department', 'jobTitle', 'site', 'manager']), 'Manager assigned');
    }

    public function uploadPhoto(Request $request, Employee $employee)
    {
        if (!$this->requireHrOrAdmin()) {
            return $this->error('Insufficient permissions.', 403);
        }

        $request->validate(['photo' => 'required|image|mimes:jpeg,png,webp,jpg|max:2048']);

        if ($employee->profile_photo) {
            $old = str_replace(asset('storage/'), '', $employee->profile_photo);
            if (Storage::disk('public')->exists($old)) {
                Storage::disk('public')->delete($old);
            }
        }

        $path = $request->file('photo')->store('profile-photos', 'public');
        $url  = asset('storage/' . $path);
        $employee->update(['profile_photo' => $url]);

        return $this->success(['profile_photo' => $url], 'Photo uploaded');
    }

    public function auditLog(Employee $employee)
    {
        $logs = \App\Models\AuditLog::where('model_type', Employee::class)
            ->where('model_id', $employee->id)
            ->with('user')
            ->latest('created_at')
            ->limit(50)
            ->get();
        return $this->success($logs);
    }
}
