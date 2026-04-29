<?php

namespace Tests\Feature\Attendance;

use App\Models\User;
use App\Models\Employee;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AttendanceTest extends TestCase
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
    }

    public function test_employee_can_check_in()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        $checkInData = [
            'latitude' => 5.6037,
            'longitude' => -0.1870,
            'location' => 'Office - Accra',
            'notes' => 'Regular check-in',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/attendance/check-in', $checkInData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'employee',
                    'check_in_time',
                    'check_in_latitude',
                    'check_in_longitude',
                    'check_in_location',
                    'status',
                ]
            ]);
    }

    public function test_employee_can_check_out()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        // First check in
        $attendance = Attendance::factory()->create([
            'employee_id' => $this->employeeRecord->id,
            'check_in_time' => Carbon::now()->subHours(8),
            'status' => 'checked_in'
        ]);

        $checkOutData = [
            'latitude' => 5.6037,
            'longitude' => -0.1870,
            'location' => 'Office - Accra',
            'notes' => 'Regular check-out',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/attendance/check-out', $checkOutData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'employee',
                    'check_in_time',
                    'check_out_time',
                    'check_out_latitude',
                    'check_out_longitude',
                    'check_out_location',
                    'status',
                    'total_hours',
                ]
            ]);
    }

    public function test_employee_cannot_check_out_without_check_in()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        $checkOutData = [
            'latitude' => 5.6037,
            'longitude' => -0.1870,
            'location' => 'Office - Accra',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/attendance/check-out', $checkOutData);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'No active check-in found'
            ]);
    }

    public function test_employee_cannot_check_in_twice()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        // First check in
        Attendance::factory()->create([
            'employee_id' => $this->employeeRecord->id,
            'check_in_time' => Carbon::now()->subHours(2),
            'status' => 'checked_in'
        ]);

        $checkInData = [
            'latitude' => 5.6037,
            'longitude' => -0.1870,
            'location' => 'Office - Accra',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/attendance/check-in', $checkInData);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Already checked in'
            ]);
    }

    public function test_admin_can_view_attendance_records()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        // Create test attendance records
        Attendance::factory()->count(10)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/attendance');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'employee',
                        'check_in_time',
                        'check_out_time',
                        'status',
                        'total_hours',
                    ]
                ],
                'links',
                'meta'
            ]);
    }

    public function test_hr_can_view_attendance_records()
    {
        $token = $this->hr->createToken('test-token')->plainTextToken;

        Attendance::factory()->count(5)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/attendance');

        $response->assertStatus(200);
    }

    public function test_employee_can_view_own_attendance_records()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        // Create attendance records for this employee
        Attendance::factory()->count(3)->create([
            'employee_id' => $this->employeeRecord->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/attendance/my-records');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'check_in_time',
                        'check_out_time',
                        'status',
                        'total_hours',
                    ]
                ]
            ]);
    }

    public function test_admin_can_view_attendance_summary()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        // Create test attendance records for different dates
        Attendance::factory()->count(20)->create([
            'check_in_time' => Carbon::now()->subDays(rand(1, 30))
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/attendance/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_employees',
                    'present_today',
                    'absent_today',
                    'late_today',
                    'average_hours_today',
                    'this_week' => [
                        'total_days',
                        'present_days',
                        'absent_days',
                        'late_days',
                    ],
                    'this_month' => [
                        'total_days',
                        'present_days',
                        'absent_days',
                        'late_days',
                    ]
                ]
            ]);
    }

    public function test_check_in_validation()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/attendance/check-in', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'latitude',
                'longitude',
                'location',
            ]);
    }

    public function test_geofencing_validation()
    {
        $token = $this->employee->createToken('test-token')->plainTextToken;

        // Check in from invalid location (too far from office)
        $checkInData = [
            'latitude' => 10.6037, // Far from Accra
            'longitude' => -5.1870,
            'location' => 'Unknown Location',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v1/attendance/check-in', $checkInData);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Location not within allowed geofence'
            ]);
    }

    public function test_unauthenticated_user_cannot_access_attendance()
    {
        $response = $this->getJson('/api/v1/attendance');

        $response->assertStatus(401);
    }
}
