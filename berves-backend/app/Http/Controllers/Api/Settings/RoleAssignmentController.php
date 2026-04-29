<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class RoleAssignmentController extends Controller
{
    /**
     * Assign role to user.
     */
    public function assignRole(Request $request, User $user): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $role = Role::findOrFail($request->role_id);
        
        // Check if user already has this role
        if ($user->roles()->where('role_id', $role->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'User already has this role'
            ], 422);
        }

        $user->roles()->attach($role->id);

        return response()->json([
            'success' => true,
            'message' => 'Role assigned successfully',
            'data' => $user->load('roles.permissions')
        ]);
    }

    /**
     * Remove role from user.
     */
    public function removeRole(User $user, Role $role): JsonResponse
    {
        if (!$user->roles()->where('role_id', $role->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'User does not have this role'
            ], 422);
        }

        $user->roles()->detach($role->id);

        return response()->json([
            'success' => true,
            'message' => 'Role removed successfully',
            'data' => $user->load('roles.permissions')
        ]);
    }

    /**
     * Assign multiple roles to user.
     */
    public function assignRoles(Request $request, User $user): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->roles()->sync($request->role_ids);

        return response()->json([
            'success' => true,
            'message' => 'Roles assigned successfully',
            'data' => $user->load('roles.permissions')
        ]);
    }

    /**
     * Get user roles and permissions.
     */
    public function getUserRoles(User $user): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $user->load('roles.permissions')
        ]);
    }

    /**
     * Get all users with their roles.
     */
    public function getUsersWithRoles(Request $request): JsonResponse
    {
        $query = User::with('roles', 'employee');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
        }

        // Filter by role
        if ($request->has('role_id')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('role_id', $request->get('role_id'));
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

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
     * Get role statistics.
     */
    public function getRoleStats(): JsonResponse
    {
        $stats = Role::withCount('users')
            ->orderBy('users_count', 'desc')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                    'users_count' => $role->users_count,
                    'permissions_count' => $role->permissions()->count(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get user permissions summary.
     */
    public function getUserPermissions(User $user): JsonResponse
    {
        $permissions = $user->getAllPermissions()
            ->groupBy('module')
            ->map(function ($permissions, $module) {
                return [
                    'module' => $module,
                    'permissions' => $permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                            'display_name' => $permission->display_name,
                            'action' => $permission->action,
                        ];
                    }),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user->only(['id', 'name', 'email']),
                'roles' => $user->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'display_name' => $role->display_name,
                    ];
                }),
                'permissions' => $permissions,
            ]
        ]);
    }

    /**
     * Bulk assign roles to multiple users.
     */
    public function bulkAssignRoles(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $userIds = $request->user_ids;
        $roleIds = $request->role_ids;

        // Use transaction for bulk operations
        DB::transaction(function () use ($userIds, $roleIds) {
            foreach ($userIds as $userId) {
                $user = User::find($userId);
                if ($user) {
                    $user->roles()->syncWithoutDetaching($roleIds);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Roles bulk assigned successfully'
        ]);
    }

    /**
     * Bulk remove roles from multiple users.
     */
    public function bulkRemoveRoles(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $userIds = $request->user_ids;
        $roleIds = $request->role_ids;

        // Use transaction for bulk operations
        DB::transaction(function () use ($userIds, $roleIds) {
            foreach ($userIds as $userId) {
                $user = User::find($userId);
                if ($user) {
                    $user->roles()->detach($roleIds);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Roles bulk removed successfully'
        ]);
    }
}
