<?php
namespace App\Http\Controllers\Api\Recruitment;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use Illuminate\Http\Request;

class JobPostingController extends Controller
{
    public function index(Request $request)
    {
        $query = JobPosting::with(['jobTitle','department','site','postedBy'])
            ->withCount('applicants')
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest();
        return $this->paginated($query);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_title_id'    => 'required|exists:job_titles,id',
            'department_id'   => 'required|exists:departments,id',
            'site_id'         => 'nullable|exists:sites,id',
            'description'     => 'required|string',
            'requirements'    => 'nullable|string',
            'employment_type' => 'required|in:permanent,contract,site_based',
            'salary_min'      => 'nullable|numeric|min:0',
            'salary_max'      => 'nullable|numeric|gte:salary_min',
            'deadline'        => 'required|date|after:today',
        ]);

        $posting = JobPosting::create([...$validated, 'posted_by' => auth()->id(), 'status' => 'open']);
        return $this->success($posting->load(['jobTitle','department','site']), 'Job posted', 201);
    }

    public function update(Request $request, JobPosting $posting)
    {
        $validated = $request->validate([
            'status'     => 'sometimes|in:draft,open,closed,filled',
            'deadline'   => 'sometimes|date',
            'salary_min' => 'nullable|numeric',
            'salary_max' => 'nullable|numeric',
        ]);
        $posting->update($validated);
        return $this->success($posting->fresh(), 'Job posting updated');
    }
}
