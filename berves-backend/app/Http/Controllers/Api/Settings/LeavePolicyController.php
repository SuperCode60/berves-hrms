<?php
namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Models\LeavePolicy;
use App\Models\LeaveType;
use App\Models\LeaveEntitlement;
use App\Models\Employee;
use Illuminate\Http\Request;

class LeavePolicyController extends Controller
{
    public function index() { 
        return $this->success(LeavePolicy::with('leaveType')->get()); 
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                  => 'required|string|max:100',
            'description'           => 'nullable|string|max:500',
            'max_days'              => 'nullable|integer|min:1',
            'max_consecutive_days' => 'nullable|integer|min:1',
            'min_service_months'   => 'nullable|integer|min:0',
            'allow_half_day'       => 'nullable|boolean',
            'effective_from'        => 'nullable|date',
        ]);

        // Create a new leave type first if name is provided
        $leaveType = \App\Models\LeaveType::create([
            'name' => $validated['name'],
            'days_per_year' => $validated['max_days'] ?? 21,
            'is_paid' => true,
            'requires_approval' => true,
            'carry_over_days' => 0,
            'notice_days' => 1,
        ]);

        // Create the policy for this leave type
        $policyData = [
            'leave_type_id' => $leaveType->id,
            'max_consecutive_days' => $validated['max_consecutive_days'] ?? null,
            'min_service_months' => $validated['min_service_months'] ?? 0,
            'allow_half_day' => $validated['allow_half_day'] ?? false,
            'effective_from' => $validated['effective_from'] ?? now(),
        ];

        $policy = LeavePolicy::create($policyData);

        // Create initial entitlements for all active employees for this new leave type
        $currentYear = date('Y');
        $employees = Employee::where('is_active', true)->get();
        
        foreach ($employees as $employee) {
            LeaveEntitlement::firstOrCreate([
                'employee_id' => $employee->id,
                'leave_type_id' => $leaveType->id,
                'year' => $currentYear,
            ], [
                'entitled_days' => $validated['max_days'] ?? 21,
                'used_days' => 0,
                'carried_over' => 0,
            ]);
        }

        return $this->success($policy->load('leaveType'), 'Leave policy created successfully with employee entitlements');
    }

    public function update(Request $request, LeavePolicy $policy)
    {
        $validated = $request->validate([
            'max_consecutive_days' => 'nullable|integer|min:1',
            'min_service_months'   => 'nullable|integer|min:0',
            'allow_half_day'       => 'boolean',
            'description'          => 'nullable|string|max:500',
        ]);
        $policy->update($validated);
        return $this->success($policy->fresh()->load('leaveType'), 'Policy updated');
    }

    public function destroy(LeavePolicy $policy)
    {
        $policy->delete();
        return $this->success(null, 'Leave policy deleted successfully');
    }

    /**
     * Get employee entitlements for a specific leave type
     */
    public function getEntitlements($leaveTypeId)
    {
        $entitlements = LeaveEntitlement::with(['employee', 'leaveType'])
            ->where('leave_type_id', $leaveTypeId)
            ->where('year', date('Y'))
            ->get()
            ->map(function ($entitlement) {
                return [
                    'id' => $entitlement->id,
                    'employee_id' => $entitlement->employee_id,
                    'employee_name' => $entitlement->employee->first_name . ' ' . $entitlement->employee->last_name,
                    'employee_email' => $entitlement->employee->email,
                    'leave_type_id' => $entitlement->leave_type_id,
                    'leave_type_name' => $entitlement->leaveType->name,
                    'year' => $entitlement->year,
                    'entitled_days' => $entitlement->entitled_days,
                    'used_days' => $entitlement->used_days,
                    'carried_over' => $entitlement->carried_over,
                    'remaining_days' => $entitlement->remaining_days,
                ];
            });

        return $this->success($entitlements);
    }

    /**
     * Update employee entitlement
     */
    public function updateEntitlement(Request $request, $entitlementId)
    {
        $validated = $request->validate([
            'entitled_days' => 'required|numeric|min:0',
            'carried_over' => 'nullable|numeric|min:0',
        ]);

        $entitlement = LeaveEntitlement::findOrFail($entitlementId);
        $entitlement->update($validated);

        return $this->success($entitlement->fresh(), 'Entitlement updated successfully');
    }

    /**
     * Bulk update entitlements for all employees for a leave type
     */
    public function bulkUpdateEntitlements(Request $request, $leaveTypeId)
    {
        $validated = $request->validate([
            'entitled_days' => 'required|numeric|min:0',
            'carried_over' => 'nullable|numeric|min:0',
            'year' => 'required|integer|min:2020|max:2030',
        ]);

        $employees = Employee::where('is_active', true)->get();
        $updated = 0;

        foreach ($employees as $employee) {
            LeaveEntitlement::updateOrCreate(
                [
                    'employee_id' => $employee->id,
                    'leave_type_id' => $leaveTypeId,
                    'year' => $validated['year'],
                ],
                [
                    'entitled_days' => $validated['entitled_days'],
                    'carried_over' => $validated['carried_over'] ?? 0,
                    'used_days' => 0, // Reset used days when bulk updating
                ]
            );
            $updated++;
        }

        return $this->success(null, "Updated {$updated} employee entitlements successfully");
    }
}
