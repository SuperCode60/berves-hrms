<?php
namespace App\Http\Controllers\Api\Performance;

use App\Http\Controllers\Controller;
use App\Models\{EmployeeAppraisal, AppraisalKpiScore, KpiDefinition};
use Illuminate\Http\Request;

class AppraisalController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = EmployeeAppraisal::with(['employee','appraiser','appraisalCycle'])
            ->when($user->role === 'employee', fn($q) => $q->where('employee_id', $user->employee_id))
            ->when($request->cycle_id, fn($q, $id) => $q->where('appraisal_cycle_id', $id))
            ->latest();
        return $this->paginated($query);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id'       => 'required|exists:employees,id',
            'appraiser_id'      => 'required|exists:employees,id',
            'appraisal_cycle_id'=> 'required|exists:appraisal_cycles,id',
        ]);

        $appraisal = EmployeeAppraisal::create($validated);

        // Auto-create KPI score rows for all relevant KPIs
        $employee = $appraisal->employee;
        $kpis = KpiDefinition::where(fn($q) =>
            $q->whereNull('department_id')->orWhere('department_id', $employee->department_id)
        )->get();

        foreach ($kpis as $kpi) {
            AppraisalKpiScore::create([
                'appraisal_id' => $appraisal->id,
                'kpi_id'       => $kpi->id,
                'target_value' => 100,
            ]);
        }

        return $this->success($appraisal->load(['employee','appraiser','appraisalCycle','kpiScores.kpi']), 'Appraisal created', 201);
    }

    public function show(EmployeeAppraisal $appraisal)
    {
        return $this->success($appraisal->load(['employee','appraiser','appraisalCycle','kpiScores.kpi']));
    }

    public function submit(EmployeeAppraisal $appraisal)
    {
        // Compute weighted overall score
        $scores = $appraisal->kpiScores()->with('kpi')->get();
        $totalWeight = $scores->sum(fn($s) => $s->kpi->weight);
        $weightedScore = $totalWeight > 0
            ? $scores->sum(fn($s) => ($s->score ?? 0) * ($s->kpi->weight / $totalWeight))
            : 0;

        $appraisal->update(['status' => 'submitted', 'overall_score' => round($weightedScore, 2)]);
        return $this->success($appraisal->fresh(), 'Appraisal submitted');
    }

    public function updateKpiScore(Request $request, EmployeeAppraisal $appraisal, KpiDefinition $kpi)
    {
        $request->validate(['actual_value' => 'required|numeric', 'comments' => 'nullable|string']);

        $score = AppraisalKpiScore::where('appraisal_id', $appraisal->id)
            ->where('kpi_id', $kpi->id)
            ->firstOrFail();

        // Score = (actual / target) * 100 capped at 100
        $computed = $score->target_value > 0
            ? min(100, round($request->actual_value / $score->target_value * 100, 2))
            : 0;

        $score->update([
            'actual_value' => $request->actual_value,
            'score'        => $computed,
            'comments'     => $request->comments,
        ]);

        return $this->success($score, 'KPI score updated');
    }
}
