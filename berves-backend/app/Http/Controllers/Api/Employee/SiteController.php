<?php
namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Models\Site;
use Illuminate\Http\Request;

class SiteController extends Controller
{
    public function index(Request $request)
    {
        $query = Site::query();
        if (!$request->boolean('all')) {
            $query->where('is_active', true);
        }
        return $this->success($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'               => 'required|string',
            'location'           => 'nullable|string',
            'latitude'           => 'nullable|numeric',
            'longitude'          => 'nullable|numeric',
            'geo_fence_radius_m' => 'nullable|integer|min:50',
        ]);
        return $this->success(Site::create($validated), 'Site created', 201);
    }

    public function show(Site $site) { return $this->success($site); }

    public function update(Request $request, Site $site)
    {
        $site->update($request->validate([
            'name'               => 'sometimes|string',
            'location'           => 'nullable|string',
            'latitude'           => 'nullable|numeric',
            'longitude'          => 'nullable|numeric',
            'geo_fence_radius_m' => 'nullable|integer|min:50',
            'is_active'          => 'boolean',
        ]));
        return $this->success($site, 'Site updated');
    }

    public function destroy(Site $site)
    {
        $site->update(['is_active' => false]);
        return $this->success(null, 'Site deactivated');
    }

    public function employees(Site $site)
    {
        $employees = $site->employees()
            ->with(['department', 'jobTitle'])
            ->orderBy('first_name')
            ->get();
        return $this->success($employees);
    }

    public function activate(Site $site)
    {
        $site->update(['is_active' => true]);
        return $this->success($site, 'Site activated');
    }

    public function deactivate(Site $site)
    {
        $site->update(['is_active' => false]);
        return $this->success($site, 'Site deactivated');
    }
}
