<?php
namespace App\Http\Controllers\Api\Safety;

use App\Http\Controllers\Controller;
use App\Models\{IncidentReport, IncidentAttachment};
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    public function index(Request $request)
    {
        $query = IncidentReport::with(['reportedByEmployee','site','injuredEmployee'])
            ->when($request->site_id, fn($q, $s) => $q->where('site_id', $s))
            ->when($request->severity, fn($q, $s) => $q->where('severity', $s))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest('incident_date');
        return $this->paginated($query);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id'          => 'required|exists:sites,id',
            'incident_date'    => 'required|date',
            'incident_time'    => 'nullable|date_format:H:i',
            'type'             => 'required|in:near_miss,first_aid,medical_treatment,lost_time,fatality,property_damage',
            'severity'         => 'required|in:low,medium,high,critical',
            'description'      => 'required|string',
            'injured_employee_id' => 'nullable|exists:employees,id',
            'injury_description'  => 'nullable|string',
            'root_cause'          => 'nullable|string',
            'corrective_actions'  => 'nullable|string',
        ]);

        $employee = auth()->user()->employee;
        $incident = IncidentReport::create([...$validated, 'reported_by' => $employee?->id ?? auth()->id()]);

        // Handle file attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store("incidents/{$incident->id}", 'public');
                IncidentAttachment::create([
                    'incident_id' => $incident->id,
                    'file_path'   => $path,
                    'file_type'   => $file->getMimeType(),
                    'uploaded_by' => auth()->id(),
                ]);
            }
        }

        return $this->success($incident->load(['reportedByEmployee','site']), 'Incident reported', 201);
    }

    public function update(Request $request, IncidentReport $incident)
    {
        $validated = $request->validate([
            'status'             => 'sometimes|in:reported,under_investigation,resolved,closed',
            'root_cause'         => 'nullable|string',
            'corrective_actions' => 'nullable|string',
            'investigated_by'    => 'nullable|exists:users,id',
        ]);

        if (($validated['status'] ?? null) === 'closed') {
            $validated['closed_at'] = now();
        }

        $incident->update($validated);
        return $this->success($incident->fresh(), 'Incident updated');
    }
}
