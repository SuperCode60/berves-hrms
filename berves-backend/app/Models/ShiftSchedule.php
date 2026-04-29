<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ShiftSchedule extends Model
{
    protected $fillable = ['employee_id','shift_template_id','site_id','schedule_date','status','created_by'];
    protected $casts = ['schedule_date'=>'date'];
    public function employee() { return $this->belongsTo(Employee::class); }
    public function shiftTemplate() { return $this->belongsTo(ShiftTemplate::class); }
    public function site() { return $this->belongsTo(Site::class); }
    public function createdBy() { return $this->belongsTo(User::class, 'created_by'); }
    public function attendanceRecord() { return $this->hasOne(AttendanceRecord::class); }
}
