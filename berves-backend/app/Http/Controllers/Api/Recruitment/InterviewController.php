<?php
namespace App\Http\Controllers\Api\Recruitment;

use App\Http\Controllers\Controller;
use App\Models\{InterviewSchedule, InterviewEvaluation};
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    public function index(Request $request)
    {
        $query = InterviewSchedule::with(['applicant.jobPosting'])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderBy('scheduled_at', 'desc');
        return $this->paginated($query);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'applicant_id'   => 'required|exists:applicants,id',
            'scheduled_at'   => 'required|date|after:now',
            'location'       => 'nullable|string',
            'interview_type' => 'required|in:phone,in_person,panel,technical',
            'interviewers'   => 'nullable|array',
            'notes'          => 'nullable|string',
        ]);

        $schedule = InterviewSchedule::create($validated);
        return $this->success($schedule->load('applicant'), 'Interview scheduled', 201);
    }

    public function evaluate(Request $request, InterviewSchedule $interview)
    {
        $validated = $request->validate([
            'score'          => 'required|integer|min:1|max:10',
            'recommendation' => 'required|in:hire,reject,hold',
            'comments'       => 'nullable|string',
        ]);

        $eval = InterviewEvaluation::updateOrCreate(
            ['interview_schedule_id' => $interview->id, 'interviewer_id' => auth()->id()],
            $validated
        );

        $interview->update(['status' => 'completed']);
        return $this->success($eval, 'Evaluation submitted', 201);
    }
}
