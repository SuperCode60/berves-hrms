<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LeaveRequest extends Model
{
    protected $fillable = [
        'employee_id','leave_type_id','start_date','end_date','days_requested',
        'reason','status','reviewed_by','reviewed_at','review_comment','has_schedule_conflict',
    ];
    protected $casts = [
        'start_date'=>'date','end_date'=>'date','days_requested'=>'decimal:1',
        'reviewed_at'=>'datetime','has_schedule_conflict'=>'boolean',
    ];
    public function employee() { return $this->belongsTo(Employee::class); }
    public function leaveType() { return $this->belongsTo(LeaveType::class); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewed_by'); }
}
