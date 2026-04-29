<?php
namespace App\Http\Controllers\Api\Safety;

use App\Http\Controllers\Controller;
use App\Models\SafetyInspection;
use Illuminate\Http\Request;

class InspectionController extends Controller
{
    public function index(Request $request)
    {
        $query = SafetyInspection::with(['site','inspector'])
            ->when($request->site_id, fn($q, $s) => $q->where('site_id', $s))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderBy('inspection_date', 'desc');
        return $this->paginated($query);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id'           => 'required|exists:sites,id',
            'inspector_id'      => 'required|exists:employees,id',
            'inspection_date'   => 'required|date',
            'findings'          => 'nullable|string',
            'risk_level'        => 'required|in:low,medium,high',
            'follow_up_required'=> 'boolean',
            'follow_up_date'    => 'nullable|date|after:inspection_date',
        ]);
        $inspection = SafetyInspection::create($validated);
        return $this->success($inspection->load(['site','inspector']), 'Inspection created', 201);
    }

    public function update(Request $request, SafetyInspection $inspection)
    {
        $validated = $request->validate([
            'status'            => 'sometimes|in:scheduled,completed,overdue',
            'findings'          => 'nullable|string',
            'follow_up_required'=> 'boolean',
            'follow_up_date'    => 'nullable|date',
        ]);
        $inspection->update($validated);
        return $this->success($inspection->fresh(), 'Inspection updated');
    }
}
