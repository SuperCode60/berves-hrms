<?php

namespace Tests\Feature\Payroll;

use App\Models\User;
use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Models\PayrollRun;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class PayrollTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create admin user
        $this->admin = User::factory()->create(['email' => 'admin@test.com']);
        $this->admin->assignRole('admin');
        
        // Create payroll officer user
        $this->payrollOfficer = User::factory()->create(['email' => 'payroll@test.com']);
        $this->payrollOfficer->assignRole('payroll_officer');
        
        // Create regular employee
        $this->employee = User::factory()->create(['email' => 'employee@test.com']);
        $this->employee->assignRole('employee');
        
        // Create test employees
        $this->employees = Employee::factory()->count(5)->create(['status' => 'active']);
    }

    public function test_admin_can_create_payroll_period()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $periodData = [
            'name' => 'March 2024',
            'start_date' => '2024-03-01',
            'end_date' => '2024-03-31',
            'payment_date' => '2024-04-05',
            'status' => 'draft',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/payroll/periods', $periodData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'start_date',
                    'end_date',
                    'payment_date',
                    'status',
                ]
            ]);
    }

    public function test_payroll_officer_can_create_payroll_period()
    {
        $token = $this->payrollOfficer->createToken('test-token')->plainTextToken;

        $periodData = [
            'name' => 'April 2024',
            'start_date' => '2024-04-01',
            'end_date' => '2024-04-30',
            'payment_date' => '2024-05-05',
            'status' => 'draft',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/payroll/periods', $periodData);

        $response->assertStatus(201);
    }

    public function test_employee_cannot_create_payroll_period()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        $periodData = [
            'name' => 'May 2024',
            'start_date' => '2024-05-01',
            'end_date' => '2024-05-31',
            'payment_date' => '2024-06-05',
            'status' => 'draft',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/payroll/periods', $periodData);

        $response->assertStatus(403);
    }

    public function test_admin_can_run_payroll()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        // Create payroll period
        $period = PayrollPeriod::factory()->create([
            'status' => 'active'
        ]);

        $runData = [
            'payroll_period_id' => $period->id,
            'run_date' => now()->format('Y-m-d'),
            'notes' => 'Monthly payroll run',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/payroll/run', $runData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'payroll_period_id',
                    'run_date',
                    'status',
                    'total_employees',
                    'total_gross_pay',
                    'total_deductions',
                    'total_net_pay',
                ]
            ]);
    }

    public function test_payroll_officer_can_run_payroll()
    {
        $token = $this->payrollOfficer->createToken('test-token')->plainTextToken;

        $period = PayrollPeriod::factory()->create(['status' => 'active']);

        $runData = [
            'payroll_period_id' => $period->id,
            'run_date' => now()->format('Y-m-d'),
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/payroll/run', $runData);

        $response->assertStatus(200);
    }

    public function test_employee_cannot_run_payroll()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        $period = PayrollPeriod::factory()->create(['status' => 'active']);

        $runData = [
            'payroll_period_id' => $period->id,
            'run_date' => now()->format('Y-m-d'),
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/payroll/run', $runData);

        $response->assertStatus(403);
    }

    public function test_admin_can_view_payroll_runs()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        // Create test payroll runs
        PayrollRun::factory()->count(3)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/payroll/runs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'payroll_period',
                        'run_date',
                        'status',
                        'total_employees',
                        'total_gross_pay',
                        'total_net_pay',
                    ]
                ],
                'links',
                'meta'
            ]);
    }

    public function test_employee_can_view_own_payslip()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        // Create payroll run
        $payrollRun = PayrollRun::factory()->create();
        
        // Create payslip for the employee
        $employeeRecord = Employee::factory()->create(['user_id' => $this->employee->id]);
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson("/api/v1/payroll/payslips/{$employeeRecord->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'employee',
                    'payroll_run',
                    'gross_pay',
                    'deductions',
                    'net_pay',
                    'pay_date',
                ]
            ]);
    }

    public function test_payroll_period_validation()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/payroll/periods', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'name',
                'start_date',
                'end_date',
                'payment_date',
            ]);
    }

    public function test_payroll_run_validation()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/payroll/run', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'payroll_period_id',
                'run_date',
            ]);
    }
}
