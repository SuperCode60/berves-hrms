<?php
namespace App\Http\Controllers\Api\Leave;

use App\Http\Controllers\Controller;
use App\Models\LeaveEntitlement;
use Illuminate\Http\Request;

class EntitlementController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = LeaveEntitlement::with(['employee','leaveType'])
            ->when($user->role === 'employee', fn($q) => $q->where('employee_id', $user->employee_id))
            ->when($request->employee_id, fn($q, $id) => $q->where('employee_id', $id))
            ->where('year', now()->year);
        return $this->success($query->get());
    }
}
