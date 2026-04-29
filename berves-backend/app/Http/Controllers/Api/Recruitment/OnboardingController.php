<?php
namespace App\Http\Controllers\Api\Recruitment;

use App\Http\Controllers\Controller;
use App\Models\{Employee, EmployeeOnboarding, OnboardingChecklist};
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    public function show(Employee $employee)
    {
        // Auto-create checklist items if not present
        $checklists = OnboardingChecklist::all();
        foreach ($checklists as $checklist) {
            EmployeeOnboarding::firstOrCreate(
                ['employee_id' => $employee->id, 'checklist_id' => $checklist->id],
                ['status' => 'pending']
            );
        }

        $tasks = EmployeeOnboarding::with('checklist')
            ->where('employee_id', $employee->id)
            ->get();

        return $this->success($tasks);
    }

    public function complete(Request $request, EmployeeOnboarding $task)
    {
        $request->validate(['status' => 'required|in:completed,skipped', 'notes' => 'nullable|string']);

        $task->update([
            'status'       => $request->status,
            'completed_at' => $request->status === 'completed' ? now() : null,
            'notes'        => $request->notes,
        ]);

        return $this->success($task->fresh(), 'Task updated');
    }
}
