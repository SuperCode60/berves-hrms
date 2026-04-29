<?php

namespace Tests\Feature\Leave;

use App\Models\User;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class LeaveTest extends TestCase
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
        
        // Create test employee record
        $this->employeeRecord = Employee::factory()->create(['user_id' => $this->employee->id]);
        
        // Create leave types
        $this->annualLeave = LeaveType::factory()->create([
            'name' => 'Annual Leave',
            'days_allowed' => 21,
            'requires_approval' => true
        ]);
        
        $this-> sickLeave = LeaveType::factory()->create([
            'name' => 'Sick Leave',
            'days_allowed' => 10,
            'requires_approval' => true
        ]);
    }

    public function test_employee_can_request_leave()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        $leaveData = [
            'leave_type_id' => $this->annualLeave->id,
            'start_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(7)->format('Y-m-d'),
            'reason' => 'Family vacation',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/leave/requests', $leaveData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'employee',
                    'leave_type',
                    'start_date',
                    'end_date',
                    'days_requested',
                    'reason',
                    'status',
                    'created_at',
                ]
            ]);
    }

    public function test_admin_can_approve_leave_request()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        // Create leave request
        $leaveRequest = LeaveRequest::factory()->create([
            'employee_id' => $this->employeeRecord->id,
            'status' => 'pending'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/v1/leave/requests/{$leaveRequest->id}/approve", [
            'comments' => 'Approved as requested'
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'status' => 'approved'
            ]);
    }

    public function test_hr_can_approve_leave_request()
    {
        $token = $this->hr->createToken('test-token')->plainTextToken;

        $leaveRequest = LeaveRequest::factory()->create([
            'employee_id' => $this->employeeRecord->id,
            'status' => 'pending'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/v1/leave/requests/{$leaveRequest->id}/approve");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'status' => 'approved'
            ]);
    }

    public function test_employee_cannot_approve_leave_request()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        $leaveRequest = LeaveRequest::factory()->create([
            'employee_id' => $this->employeeRecord->id,
            'status' => 'pending'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/v1/leave/requests/{$leaveRequest->id}/approve");

        $response->assertStatus(403);
    }

    public function test_admin_can_reject_leave_request()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $leaveRequest = LeaveRequest::factory()->create([
            'employee_id' => $this->employeeRecord->id,
            'status' => 'pending'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/v1/leave/requests/{$leaveRequest->id}/reject", [
            'reason' => 'Insufficient leave balance'
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'status' => 'rejected'
            ]);
    }

    public function test_employee_can_view_own_leave_requests()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        // Create leave requests for this employee
        LeaveRequest::factory()->count(3)->create([
            'employee_id' => $this->employeeRecord->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/leave/my-requests');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'leave_type',
                        'start_date',
                        'end_date',
                        'days_requested',
                        'reason',
                        'status',
                        'created_at',
                    ]
                ]
            ]);
    }

    public function test_admin_can_view_all_leave_requests()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        // Create leave requests for different employees
        LeaveRequest::factory()->count(10)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/leave/requests');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'employee',
                        'leave_type',
                        'start_date',
                        'end_date',
                        'days_requested',
                        'reason',
                        'status',
                        'created_at',
                    ]
                ],
                'links',
                'meta'
            ]);
    }

    public function test_employee_can_view_leave_balance()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/leave/balance');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'leave_type',
                        'total_days',
                        'used_days',
                        'remaining_days',
                        'pending_days',
                    ]
                ]
            ]);
    }

    public function test_leave_request_validation()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/leave/requests', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'leave_type_id',
                'start_date',
                'end_date',
                'reason',
            ]);
    }

    public function test_cannot_request_leave_in_past()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        $leaveData = [
            'leave_type_id' => $this->annualLeave->id,
            'start_date' => Carbon::yesterday()->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(2)->format('Y-m-d'),
            'reason' => 'Test leave',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/leave/requests', $leaveData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_date']);
    }

    public function test_cannot_request_end_date_before_start_date()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        $leaveData = [
            'leave_type_id' => $this->annualLeave->id,
            'start_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(3)->format('Y-m-d'),
            'reason' => 'Test leave',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/leave/requests', $leaveData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    }

    public function test_cannot_approve_already_approved_request()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $leaveRequest = LeaveRequest::factory()->create([
            'employee_id' => $this->employeeRecord->id,
            'status' => 'approved'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/v1/leave/requests/{$leaveRequest->id}/approve");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Leave request already processed'
            ]);
    }

    public function test_unauthenticated_user_cannot_access_leave()
    {
        $response = $this->getJson('/api/v1/leave/requests');

        $response->assertStatus(401);
    }
}
