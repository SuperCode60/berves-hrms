<?php
namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Models\OvertimePolicy;
use Illuminate\Http\Request;

class OvertimePolicyController extends Controller
{
    public function index()
    {
        return $this->success(OvertimePolicy::orderBy('day_type')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'day_type'   => 'required|in:weekday,sunday,public_holiday|unique:overtime_policies,day_type',
            'multiplier' => 'required|numeric|min:1|max:5',
            'min_hours'  => 'nullable|numeric|min:0',
            'max_hours'  => 'nullable|numeric|min:1',
            'is_active'  => 'boolean',
        ]);

        $policy = OvertimePolicy::create(array_merge($data, [
            'is_active'  => $data['is_active'] ?? true,
            'min_hours'  => $data['min_hours']  ?? 1,
            'max_hours'  => $data['max_hours']  ?? 12,
            'updated_by' => auth()->id(),
        ]));

        return $this->success($policy, 'Overtime policy created', 201);
    }

    public function update(Request $request, OvertimePolicy $policy)
    {
        $data = $request->validate([
            'day_type'   => 'sometimes|in:weekday,sunday,public_holiday|unique:overtime_policies,day_type,' . $policy->id,
            'multiplier' => 'required|numeric|min:1|max:5',
            'min_hours'  => 'nullable|numeric|min:0',
            'max_hours'  => 'nullable|numeric|min:1',
            'is_active'  => 'boolean',
        ]);

        $policy->update(array_merge($data, ['updated_by' => auth()->id()]));

        return $this->success($policy->fresh(), 'Policy updated');
    }

    public function destroy(OvertimePolicy $policy)
    {
        $policy->delete();
        return $this->success([], 'Policy deleted');
    }

    public function activate(OvertimePolicy $policy)
    {
        $policy->update(['is_active' => true, 'updated_by' => auth()->id()]);
        return $this->success($policy->fresh(), 'Policy activated');
    }

    public function deactivate(OvertimePolicy $policy)
    {
        $policy->update(['is_active' => false, 'updated_by' => auth()->id()]);
        return $this->success($policy->fresh(), 'Policy deactivated');
    }
}
