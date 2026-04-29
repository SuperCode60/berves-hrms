<?php
namespace App\Http\Controllers\Api\Leave;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    public function index() { return $this->success(LeaveType::all()); }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|unique:leave_types',
            'days_per_year'    => 'required|integer|min:1',
            'is_paid'          => 'boolean',
            'requires_approval'=> 'boolean',
            'carry_over_days'  => 'integer|min:0',
            'notice_days'      => 'integer|min:0',
        ]);
        return $this->success(LeaveType::create($validated), 'Leave type created', 201);
    }
}
