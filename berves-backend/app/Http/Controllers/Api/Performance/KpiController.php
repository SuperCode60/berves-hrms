<?php
namespace App\Http\Controllers\Api\Performance;

use App\Http\Controllers\Controller;
use App\Models\KpiDefinition;
use Illuminate\Http\Request;

class KpiController extends Controller
{
    public function index() { return $this->success(KpiDefinition::with('department')->get()); }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string',
            'description'      => 'nullable|string',
            'measurement_unit' => 'required|string',
            'department_id'    => 'nullable|exists:departments,id',
            'weight'           => 'required|numeric|min:0|max:100',
        ]);
        return $this->success(KpiDefinition::create($validated), 'KPI created', 201);
    }
}
