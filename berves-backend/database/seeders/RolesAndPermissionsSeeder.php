<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // Employees module
            'employees' => [
                'create' => 'Create Employee',
                'read' => 'View Employee',
                'update' => 'Update Employee',
                'delete' => 'Delete Employee',
                'manage' => 'Manage Employees',
            ],
            // Attendance module
            'attendance' => [
                'create' => 'Create Attendance',
                'read' => 'View Attendance',
                'update' => 'Update Attendance',
                'delete' => 'Delete Attendance',
                'manage' => 'Manage Attendance',
            ],
            // Leave module
            'leave' => [
                'create' => 'Create Leave Request',
                'read' => 'View Leave Request',
                'update' => 'Update Leave Request',
                'delete' => 'Delete Leave Request',
                'approve' => 'Approve Leave',
                'manage' => 'Manage Leave',
            ],
            // Payroll module
            'payroll' => [
                'create' => 'Create Payroll',
                'read' => 'View Payroll',
                'update' => 'Update Payroll',
                'delete' => 'Delete Payroll',
                'manage' => 'Manage Payroll',
            ],
            // Settings module
            'settings' => [
                'read' => 'View Settings',
                'update' => 'Update Settings',
                'manage' => 'Manage Settings',
                'manage_roles' => 'Manage Roles',
                'manage_permissions' => 'Manage Permissions',
            ],
            // Reports module
            'reports' => [
                'read' => 'View Reports',
                'create' => 'Create Reports',
                'export' => 'Export Reports',
                'manage' => 'Manage Reports',
            ],
        ];

        foreach ($permissions as $module => $modulePermissions) {
            foreach ($modulePermissions as $action => $displayName) {
                Permission::firstOrCreate([
                    'name' => "{$module}.{$action}",
                    'module' => $module,
                    'action' => $action,
                ], [
                    'display_name' => $displayName,
                    'description' => "Permission to {$action} {$module}",
                ]);
            }
        }

        // Create roles
        $roles = [
            'admin' => [
                'display_name' => 'Administrator',
                'description' => 'Full system access',
                'permissions' => '*', // All permissions
            ],
            'hr' => [
                'display_name' => 'HR Manager',
                'description' => 'Human Resources management',
                'permissions' => [
                    'employees.create', 'employees.read', 'employees.update', 'employees.manage',
                    'attendance.read', 'attendance.manage',
                    'leave.create', 'leave.read', 'leave.update', 'leave.approve', 'leave.manage',
                    'reports.read', 'reports.create', 'reports.export',
                ],
            ],
            'payroll_officer' => [
                'display_name' => 'Payroll Officer',
                'description' => 'Payroll management',
                'permissions' => [
                    'employees.read',
                    'payroll.create', 'payroll.read', 'payroll.update', 'payroll.manage',
                    'reports.read', 'reports.create', 'reports.export',
                ],
            ],
            'manager' => [
                'display_name' => 'Manager',
                'description' => 'Department management',
                'permissions' => [
                    'employees.read', 'employees.update',
                    'attendance.read', 'attendance.manage',
                    'leave.read', 'leave.approve',
                    'reports.read',
                ],
            ],
            'employee' => [
                'display_name' => 'Employee',
                'description' => 'Basic employee access',
                'permissions' => [
                    'employees.read', // Can view own profile
                    'attendance.read', // Can view own attendance
                    'leave.create', 'leave.read', 'leave.update', // Can manage own leave
                    'reports.read', // Can view basic reports
                ],
            ],
        ];

        foreach ($roles as $roleName => $roleData) {
            $role = Role::firstOrCreate([
                'name' => $roleName,
            ], [
                'display_name' => $roleData['display_name'],
                'description' => $roleData['description'],
            ]);

            // Assign permissions
            if ($roleData['permissions'] === '*') {
                // All permissions for admin
                $allPermissions = Permission::all();
                $role->permissions()->sync($allPermissions);
            } else {
                // Specific permissions
                $permissionIds = Permission::whereIn('name', $roleData['permissions'])->pluck('id');
                $role->permissions()->sync($permissionIds);
            }
        }

        // Assign roles to existing users
        $users = [
            'admin@berves.com' => 'admin',
            'hr@berves.com' => 'hr',
            'payroll@berves.com' => 'payroll_officer',
            'employee@berves.com' => 'employee',
        ];

        foreach ($users as $email => $roleName) {
            $user = User::where('email', $email)->first();
            $role = Role::where('name', $roleName)->first();
            
            if ($user && $role) {
                $user->roles()->sync([$role->id]);
            }
        }

        $this->command->info('Roles and permissions created successfully!');
    }
}
