<?php
namespace App\Http\Controllers\Api\Performance;

use App\Http\Controllers\Controller;
use App\Models\AppraisalCycle;
use Illuminate\Http\Request;

class AppraisalCycleController extends Controller
{
    public function index() { return $this->success(AppraisalCycle::latest()->get()); }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|unique:appraisal_cycles',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after:start_date',
        ]);
        return $this->success(AppraisalCycle::create($validated), 'Cycle created', 201);
    }
}
