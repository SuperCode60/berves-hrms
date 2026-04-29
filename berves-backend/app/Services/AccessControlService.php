<?php

namespace App\Services;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class AccessControlService
{
    /**
     * Get all permissions for a user
     */
    public function getUserPermissions(User $user): Collection
    {
        return Cache::remember(
            "user_permissions_{$user->id}",
            now()->addHours(1),
            function () use ($user) {
                return $user->getAllPermissions();
            }
        );
    }

    /**
     * Get all roles for a user
     */
    public function getUserRoles(User $user): Collection
    {
        return Cache::remember(
            "user_roles_{$user->id}",
            now()->addHours(1),
            function () use ($user) {
                return $user->roles;
            }
        );
    }

    /**
     * Check if user has specific permission
     */
    public function userHasPermission(User $user, string $permission): bool
    {
        return $user->hasPermissionTo($permission);
    }

    /**
     * Check if user has any of the specified roles
     */
    public function userHasAnyRole(User $user, array $roles): bool
    {
        return $user->hasAnyRole($roles);
    }

    /**
     * Check if user has all specified roles
     */
    public function userHasAllRoles(User $user, array $roles): bool
    {
        return $user->hasAllRoles($roles);
    }

    /**
     * Get users with specific role
     */
    public function getUsersWithRole(string $roleName): Collection
    {
        return User::whereHas('roles', function ($query) use ($roleName) {
            $query->where('name', $roleName);
        })->with('roles', 'employee')->get();
    }

    /**
     * Get users with specific permission
     */
    public function getUsersWithPermission(string $permissionName): Collection
    {
        return User::whereHas('permissions', function ($query) use ($permissionName) {
            $query->where('name', $permissionName);
        })->with('roles', 'permissions', 'employee')->get();
    }

    /**
     * Get role statistics
     */
    public function getRoleStatistics(): Collection
    {
        return Role::withCount('users')
            ->withCount('permissions')
            ->orderBy('users_count', 'desc')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                    'users_count' => $role->users_count,
                    'permissions_count' => $role->permissions_count,
                    'description' => $role->description,
                ];
            });
    }

    /**
     * Get permission statistics
     */
    public function getPermissionStatistics(): Collection
    {
        return Permission::withCount('roles')
            ->withCount('users')
            ->orderBy('roles_count', 'desc')
            ->get()
            ->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'display_name' => $permission->display_name,
                    'module' => $permission->module,
                    'action' => $permission->action,
                    'roles_count' => $permission->roles_count,
                    'users_count' => $permission->users_count,
                    'description' => $permission->description,
                ];
            });
    }

    /**
     * Get user access summary
     */
    public function getUserAccessSummary(User $user): array
    {
        $permissions = $this->getUserPermissions($user);
        $roles = $this->getUserRoles($user);

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'roles' => $roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                    'description' => $role->description,
                ];
            }),
            'permissions' => $permissions->groupBy('module')->map(function ($permissions, $module) {
                return [
                    'module' => $module,
                    'permissions' => $permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                            'display_name' => $permission->display_name,
                            'action' => $permission->action,
                            'description' => $permission->description,
                        ];
                    }),
                ];
            })->values(),
            'statistics' => [
                'total_roles' => $roles->count(),
                'total_permissions' => $permissions->count(),
                'modules' => $permissions->pluck('module')->unique()->count(),
            ],
        ];
    }

    /**
     * Clear user access cache
     */
    public function clearUserCache(User $user): void
    {
        Cache::forget("user_permissions_{$user->id}");
        Cache::forget("user_roles_{$user->id}");
    }

    /**
     * Clear all access control caches
     */
    public function clearAllCaches(): void
    {
        $users = User::all();
        foreach ($users as $user) {
            $this->clearUserCache($user);
        }
    }

    /**
     * Validate role assignment constraints
     */
    public function validateRoleAssignment(User $user, Role $role): array
    {
        $errors = [];

        // Check if user already has the role
        if ($user->roles()->where('role_id', $role->id)->exists()) {
            $errors[] = 'User already has this role';
        }

        // Add any business logic constraints here
        // For example, prevent certain role combinations
        if ($role->name === 'super_admin' && $user->roles()->count() > 0) {
            $errors[] = 'Super admin role cannot be combined with other roles';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Get available permissions for a module
     */
    public function getModulePermissions(string $module): Collection
    {
        return Permission::where('module', $module)
            ->orderBy('action')
            ->get();
    }

    /**
     * Create default permissions for a module
     */
    public function createDefaultModulePermissions(string $module, array $actions = ['create', 'read', 'update', 'delete']): Collection
    {
        $permissions = collect();

        foreach ($actions as $action) {
            $permission = Permission::firstOrCreate([
                'name' => "{$module}.{$action}",
                'module' => $module,
                'action' => $action,
            ], [
                'display_name' => ucfirst($action) . ' ' . ucfirst($module),
                'description' => "Permission to {$action} {$module}",
            ]);

            $permissions->push($permission);
        }

        return $permissions;
    }

    /**
     * Sync role permissions with module
     */
    public function syncRoleWithModule(Role $role, string $module, array $actions = null): void
    {
        $permissions = $actions 
            ? Permission::where('module', $module)->whereIn('action', $actions)->get()
            : Permission::where('module', $module)->get();

        $role->permissions()->sync($permissions->pluck('id'));
    }
}
