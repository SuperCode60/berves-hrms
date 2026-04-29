<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\{User, Employee, Department, JobTitle, Site};

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $site = Site::first();
        $dept = Department::where('name','Human Resources')->first();
        $title = JobTitle::where('title','HR Manager')->first();

        // Seed admin employee + user
        $adminEmployee = Employee::updateOrCreate(
            ['email' => 'admin@berves.com'],
            [
                'employee_number'   => 'BEL-0001',
                'first_name'        => 'System',
                'last_name'         => 'Administrator',
                'phone'             => '+233200000001',
                'gender'            => 'male',
                'department_id'     => $dept->id,
                'job_title_id'      => $title->id,
                'site_id'           => $site->id,
                'employment_type'   => 'permanent',
                'employment_status' => 'active',
                'hire_date'         => '2020-01-01',
                'base_salary'       => 8000,
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@berves.com'],
            ['employee_id' => $adminEmployee->id, 'password' => Hash::make('password'), 'role' => 'admin', 'is_active' => true]
        );

        // HR User
        $hrEmployee = Employee::updateOrCreate(
            ['email' => 'hr@berves.com'],
            [
                'employee_number'   => 'BEL-0002',
                'first_name'        => 'Abena',
                'last_name'         => 'Mensah',
                'phone'             => '+233200000002',
                'gender'            => 'female',
                'department_id'     => $dept->id,
                'job_title_id'      => $title->id,
                'site_id'           => $site->id,
                'employment_type'   => 'permanent',
                'employment_status' => 'active',
                'hire_date'         => '2021-03-01',
                'base_salary'       => 5500,
            ]
        );
        User::updateOrCreate(
            ['email' => 'hr@berves.com'],
            ['employee_id' => $hrEmployee->id, 'password' => Hash::make('password'), 'role' => 'hr', 'is_active' => true]
        );

        // Payroll Officer
        $payrollEmp = Employee::updateOrCreate(
            ['email' => 'payroll@berves.com'],
            [
                'employee_number'   => 'BEL-0003',
                'first_name'        => 'Kofi',
                'last_name'         => 'Asante',
                'phone'             => '+233200000003',
                'gender'            => 'male',
                'department_id'     => Department::where('name','Finance')->first()->id,
                'job_title_id'      => JobTitle::where('title','Payroll Officer')->first()->id,
                'site_id'           => $site->id,
                'employment_type'   => 'permanent',
                'employment_status' => 'active',
                'hire_date'         => '2022-06-01',
                'base_salary'       => 4800,
            ]
        );
        User::updateOrCreate(
            ['email' => 'payroll@berves.com'],
            ['employee_id' => $payrollEmp->id, 'password' => Hash::make('password'), 'role' => 'payroll_officer', 'is_active' => true]
        );

        // Sample Employee
        $emp = Employee::updateOrCreate(
            ['email' => 'employee@berves.com'],
            [
                'employee_number'   => 'BEL-0004',
                'first_name'        => 'Kwame',
                'last_name'         => 'Boateng',
                'phone'             => '+233200000004',
                'gender'            => 'male',
                'department_id'     => Department::where('name','Engineering')->first()->id,
                'job_title_id'      => JobTitle::where('title','Senior Engineer')->first()->id,
                'site_id'           => Site::where('name','Mine Site Alpha')->first()->id,
                'employment_type'   => 'permanent',
                'employment_status' => 'active',
                'hire_date'         => '2023-01-15',
                'base_salary'       => 6200,
            ]
        );
        User::updateOrCreate(
            ['email' => 'employee@berves.com'],
            ['employee_id' => $emp->id, 'password' => Hash::make('password'), 'role' => 'employee', 'is_active' => true]
        );

        $this->command->info('Users seeded. Login credentials:');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['Admin', 'admin@berves.com', 'password'],
                ['HR', 'hr@berves.com', 'password'],
                ['Payroll Officer', 'payroll@berves.com', 'password'],
                ['Employee', 'employee@berves.com', 'password'],
            ]
        );
    }
}
