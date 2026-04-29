<?php

namespace Tests\Feature\Employees;

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class EmployeeTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create admin user
        $this->admin = User::factory()->create(['email' => 'admin@test.com']);
        $this->admin->assignRole('admin');
        
        // Create HR user
        $this->hr = User::factory()->create(['email' => 'hr@test.com']);
        $this->hr->assignRole('hr');
        
        // Create regular employee
        $this->employee = User::factory()->create(['email' => 'employee@test.com']);
        $this->employee->assignRole('employee');
        
        // Create test department
        $this->department = Department::factory()->create();
    }

    public function test_admin_can_create_employee()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $employeeData = [
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            'employee_id' => 'EMP' . $this->faker->unique()->numberBetween(1000, 9999),
            'department_id' => $this->department->id,
            'position' => $this->faker->jobTitle,
            'salary' => $this->faker->numberBetween(3000, 15000),
            'hire_date' => $this->faker->date(),
            'status' => 'active',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/employees', $employeeData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'phone',
                    'employee_id',
                    'department',
                    'position',
                    'salary',
                    'hire_date',
                    'status',
                ]
            ]);
    }

    public function test_hr_can_create_employee()
    {
        $token = $this->hr->createToken('test-token')->plainTextToken;

        $employeeData = [
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            'employee_id' => 'EMP' . $this->faker->unique()->numberBetween(1000, 9999),
            'department_id' => $this->department->id,
            'position' => $this->faker->jobTitle,
            'salary' => $this->faker->numberBetween(3000, 15000),
            'hire_date' => $this->faker->date(),
            'status' => 'active',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/employees', $employeeData);

        $response->assertStatus(201);
    }

    public function test_employee_cannot_create_employee()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        $employeeData = [
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'email' => $this->faker->unique()->safeEmail,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/employees', $employeeData);

        $response->assertStatus(403);
    }

    public function test_admin_can_view_employees()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        // Create test employees
        Employee::factory()->count(5)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/employees');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'first_name',
                        'last_name',
                        'email',
                        'phone',
                        'employee_id',
                        'department',
                        'position',
                        'status',
                    ]
                ],
                'links',
                'meta'
            ]);
    }

    public function test_admin_can_view_single_employee()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $employee = Employee::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson("/api/v1/employees/{$employee->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'phone',
                    'employee_id',
                    'department',
                    'position',
                    'salary',
                    'hire_date',
                    'status',
                ]
            ]);
    }

    public function test_admin_can_update_employee()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $employee = Employee::factory()->create();

        $updateData = [
            'first_name' => 'Updated Name',
            'position' => 'Updated Position',
            'salary' => 8000,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/v1/employees/{$employee->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'first_name' => 'Updated Name',
                'position' => 'Updated Position',
                'salary' => 8000,
            ]);
    }

    public function test_admin_can_delete_employee()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $employee = Employee::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson("/api/v1/employees/{$employee->id}");

        $response->assertStatus(204);
        
        $this->assertSoftDeleted('employees', [
            'id' => $employee->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_access_employees()
    {
        $response = $this->getJson('/api/v1/employees');

        $response->assertStatus(401);
    }

    public function test_employee_creation_validation()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/employees', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'first_name',
                'last_name',
                'email',
                'employee_id',
                'department_id',
                'position',
                'salary',
                'hire_date',
            ]);
    }
}
