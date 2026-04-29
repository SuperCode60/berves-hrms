<?php
namespace App\Http\Controllers\Api\Training;

use App\Http\Controllers\Controller;
use App\Models\TrainingProgram;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index(Request $request)
    {
        $query = TrainingProgram::latest();
        return $this->paginated($query);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'               => 'required|string',
            'description'        => 'nullable|string',
            'provider'           => 'nullable|string',
            'duration_hours'     => 'nullable|integer|min:1',
            'is_mandatory'       => 'boolean',
            'recurrence_months'  => 'nullable|integer|min:1',
        ]);
        return $this->success(TrainingProgram::create($validated), 'Program created', 201);
    }
}
