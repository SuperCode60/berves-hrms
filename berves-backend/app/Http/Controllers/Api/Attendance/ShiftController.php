<?php
namespace App\Http\Controllers\Api\Attendance;

use App\Http\Controllers\Controller;
use App\Models\{ShiftTemplate, ShiftSchedule};
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function templates()
    {
        return $this->success(ShiftTemplate::all());
    }

    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string',
            'start_time'    => 'required|date_format:H:i',
            'end_time'      => 'required|date_format:H:i',
            'break_minutes' => 'integer|min:0',
            'type'          => 'required|in:day,night,custom',
        ]);
        return $this->success(ShiftTemplate::create($validated), 'Shift template created', 201);
    }

    public function schedules(Request $request)
    {
        $query = ShiftSchedule::with(['employee','shiftTemplate','site'])
            ->when($request->employee_id, fn($q, $id) => $q->where('employee_id', $id))
            ->when($request->date, fn($q, $d) => $q->where('schedule_date', $d))
            ->when($request->site_id, fn($q, $s) => $q->where('site_id', $s))
            ->orderBy('schedule_date', 'desc');
        return $this->paginated($query);
    }

    public function storeSchedule(Request $request)
    {
        $validated = $request->validate([
            'employee_id'       => 'required|exists:employees,id',
            'shift_template_id' => 'required|exists:shift_templates,id',
            'site_id'           => 'required|exists:sites,id',
            'schedule_date'     => 'required|date',
        ]);

        $schedule = ShiftSchedule::create([...$validated, 'created_by' => auth()->id()]);
        return $this->success($schedule->load(['employee','shiftTemplate','site']), 'Shift scheduled', 201);
    }

    public function bulkSchedule(Request $request)
    {
        $request->validate([
            'schedules'                     => 'required|array',
            'schedules.*.employee_id'       => 'required|exists:employees,id',
            'schedules.*.shift_template_id' => 'required|exists:shift_templates,id',
            'schedules.*.site_id'           => 'required|exists:sites,id',
            'schedules.*.schedule_date'     => 'required|date',
        ]);

        $created = collect($request->schedules)->map(fn($s) =>
            ShiftSchedule::create([...$s, 'created_by' => auth()->id()])
        );

        return $this->success(['count' => $created->count()], 'Bulk shifts scheduled', 201);
    }
}
