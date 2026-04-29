<?php
namespace App\Http\Controllers\Api\Recruitment;

use App\Http\Controllers\Controller;
use App\Models\{Applicant, JobPosting};
use Illuminate\Http\Request;

class ApplicantController extends Controller
{
    public function index(Request $request, JobPosting $posting)
    {
        $query = $posting->applicants()
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest('applied_at');
        return $this->paginated($query);
    }

    public function update(Request $request, Applicant $applicant)
    {
        $request->validate(['status' => 'required|in:applied,shortlisted,interviewed,offered,rejected,hired']);
        $applicant->update(['status' => $request->status]);
        return $this->success($applicant, 'Applicant status updated');
    }
}
