<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_number','first_name','last_name','other_names','date_of_birth',
        'gender','national_id','tin_number','ssnit_number','phone','email','address',
        'emergency_contact_name','emergency_contact_phone','department_id','job_title_id',
        'site_id','manager_id','employment_type','employment_status','hire_date',
        'contract_end_date','probation_end_date','base_salary','bank_name',
        'bank_account','bank_branch','profile_photo',
    ];

    protected $casts = [
        'hire_date'          => 'date',
        'contract_end_date'  => 'date',
        'probation_end_date' => 'date',
        'date_of_birth'      => 'date',
        'base_salary'        => 'decimal:2',
        // Encrypt sensitive financial identifiers at rest
        'bank_account'       => 'encrypted',
    ];

    /* ── Relationships ───────────────────────────────────────── */
    public function user()               { return $this->hasOne(User::class); }
    public function department()         { return $this->belongsTo(Department::class); }
    public function jobTitle()           { return $this->belongsTo(JobTitle::class); }
    public function site()               { return $this->belongsTo(Site::class); }
    public function manager()            { return $this->belongsTo(Employee::class, 'manager_id'); }
    public function subordinates()       { return $this->hasMany(Employee::class, 'manager_id'); }
    public function documents()          { return $this->hasMany(EmployeeDocument::class); }
    public function allowances()         { return $this->hasMany(EmployeeAllowance::class); }
    public function attendanceRecords()  { return $this->hasMany(AttendanceRecord::class); }
    public function leaveRequests()      { return $this->hasMany(LeaveRequest::class); }
    public function payrollRuns()        { return $this->hasMany(PayrollRun::class); }
    public function trainingEnrollments(){ return $this->hasMany(TrainingEnrollment::class); }
    public function appraisals()         { return $this->hasMany(EmployeeAppraisal::class); }
    public function loans()              { return $this->hasMany(EmployeeLoan::class); }

    /* ── Helpers ─────────────────────────────────────────────── */
    public static function generateNumber(): string
    {
        $last = static::withTrashed()->latest('id')->value('employee_number');
        $num  = $last ? (int) substr($last, 4) + 1 : 1;
        return 'BEL-' . str_pad($num, 4, '0', STR_PAD_LEFT);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getProfilePhotoUrlAttribute(): string
    {
        if ($this->profile_photo) {
            return asset('storage/profile-photos/' . $this->profile_photo);
        }
        
        // Generate default avatar with initials
        $initials = strtoupper(substr($this->first_name, 0, 1) . substr($this->last_name, 0, 1));
        $backgroundColor = $this->getAvatarBackgroundColor($this->id);
        
        return "https://ui-avatars.com/api/?name={$initials}&background={$backgroundColor}&color=fff&size=128&bold=true";
    }

    private function getAvatarBackgroundColor($id): string
    {
        $colors = [
            'FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7',
            'DDA0DD', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E2',
            'F8B739', '52B788', 'E76F51', '8ECAE6', 'F4A261'
        ];
        
        return $colors[$id % count($colors)];
    }

    public function scopeActive($query)
    {
        return $query->where('employment_status', 'active');
    }
}
