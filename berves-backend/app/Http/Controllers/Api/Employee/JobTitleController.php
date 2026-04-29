<?php
namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Models\JobTitle;
use Illuminate\Http\Request;

class JobTitleController extends Controller
{
    public function index()
    {
        return $this->success(JobTitle::with('department')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['title' => 'required|string', 'grade' => 'nullable|string', 'department_id' => 'nullable|exists:departments,id']);
        return $this->success(JobTitle::create($validated), 'Job title created', 201);
    }
}
