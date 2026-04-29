<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PermissionController extends Controller
{
    /**
     * Display a listing of permissions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Permission::with('roles');

        // Filter by module
        if ($request->has('module')) {
            $query->where('module', $request->get('module'));
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('display_name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
        }

        // Group by module
        if ($request->get('grouped', false)) {
            $permissions = $query->get()->groupBy('module');
            
            return response()->json([
                'success' => true,
                'data' => $permissions
            ]);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $permissions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $permissions->items(),
            'meta' => [
                'current_page' => $permissions->currentPage(),
                'last_page' => $permissions->lastPage(),
                'per_page' => $permissions->perPage(),
                'total' => $permissions->total(),
            ]
        ]);
    }

    /**
     * Store a newly created permission.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:permissions,name',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'module' => 'required|string|max:100',
            'action' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $permission = Permission::create([
            'name' => Str::slug($request->name),
            'display_name' => $request->display_name,
            'description' => $request->description,
            'module' => $request->module,
            'action' => $request->action,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permission created successfully',
            'data' => $permission
        ], 201);
    }

    /**
     * Display the specified permission.
     */
    public function show(Permission $permission): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $permission->load('roles', 'users')
        ]);
    }

    /**
     * Update the specified permission.
     */
    public function update(Request $request, Permission $permission): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'module' => 'required|string|max:100',
            'action' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $permission->update([
            'name' => Str::slug($request->name),
            'display_name' => $request->display_name,
            'description' => $request->description,
            'module' => $request->module,
            'action' => $request->action,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permission updated successfully',
            'data' => $permission
        ]);
    }

    /**
     * Remove the specified permission.
     */
    public function destroy(Permission $permission): JsonResponse
    {
        // Check if permission is assigned to roles
        if ($permission->roles()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete permission assigned to roles'
            ], 422);
        }

        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Permission deleted successfully'
        ]);
    }

    /**
     * Get all permissions without pagination (for dropdowns).
     */
    public function all(): JsonResponse
    {
        $permissions = Permission::all();

        return response()->json([
            'success' => true,
            'data' => $permissions
        ]);
    }

    /**
     * Get permissions grouped by module.
     */
    public function grouped(): JsonResponse
    {
        $permissions = Permission::all()->groupBy('module');

        return response()->json([
            'success' => true,
            'data' => $permissions
        ]);
    }

    /**
     * Get available modules.
     */
    public function modules(): JsonResponse
    {
        $modules = Permission::select('module')
            ->distinct()
            ->orderBy('module')
            ->pluck('module');

        return response()->json([
            'success' => true,
            'data' => $modules
        ]);
    }

    /**
     * Get roles that have this permission.
     */
    public function roles(Permission $permission): JsonResponse
    {
        $roles = $permission->roles;

        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }

    /**
     * Get users that have this permission.
     */
    public function users(Permission $permission): JsonResponse
    {
        $users = $permission->users()->with('employee')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    /**
     * Bulk create permissions for a module.
     */
    public function bulkCreate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'module' => 'required|string|max:100',
            'permissions' => 'required|array',
            'permissions.*.name' => 'required|string|max:255',
            'permissions.*.display_name' => 'required|string|max:255',
            'permissions.*.description' => 'nullable|string|max:1000',
            'permissions.*.action' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $createdPermissions = [];
        $module = $request->module;

        foreach ($request->permissions as $permissionData) {
            $permission = Permission::create([
                'name' => Str::slug($permissionData['name']),
                'display_name' => $permissionData['display_name'],
                'description' => $permissionData['description'] ?? null,
                'module' => $module,
                'action' => $permissionData['action'],
            ]);
            
            $createdPermissions[] = $permission;
        }

        return response()->json([
            'success' => true,
            'message' => 'Permissions created successfully',
            'data' => $createdPermissions
        ], 201);
    }
}
