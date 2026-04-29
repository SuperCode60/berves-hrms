<?php
namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Models\TrainingEnrollment;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $query = TrainingEnrollment::with(['employee.site','trainingProgram'])
            ->when($request->employee_id, fn($q, $id) => $q->where('employee_id', $id))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest();
        return $this->paginated($query);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id'        => 'required|exists:employees,id',
            'training_program_id'=> 'required|exists:training_programs,id',
            'scheduled_date'     => 'nullable|date',
        ]);

        $enrollment = TrainingEnrollment::create($validated);
        return $this->success($enrollment->load(['employee','trainingProgram']), 'Enrolled', 201);
    }

    public function update(Request $request, TrainingEnrollment $enrollment)
    {
        $validated = $request->validate([
            'status'         => 'sometimes|in:enrolled,in_progress,completed,failed,expired',
            'completed_date' => 'nullable|date',
            'score'          => 'nullable|numeric|min:0|max:100',
            'certificate_path'=> 'nullable|string',
        ]);

        if (($validated['status'] ?? null) === 'completed') {
            $program = $enrollment->trainingProgram;
            if ($program->recurrence_months) {
                $validated['expiry_date'] = now()->addMonths($program->recurrence_months)->format('Y-m-d');
            }
        }

        $enrollment->update($validated);
        return $this->success($enrollment->fresh(['employee','trainingProgram']), 'Enrollment updated');
    }

    public function expiring()
    {
        $expiring = TrainingEnrollment::with(['employee.site','trainingProgram'])
            ->whereBetween('expiry_date', [today(), today()->addDays(30)])
            ->where('status', 'completed')
            ->orderBy('expiry_date')
            ->get();
        return $this->success($expiring);
    }
}
