<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AttendanceRecord extends Model
{
    protected $fillable = [
        'employee_id','site_id','shift_schedule_id','check_in_at','check_out_at',
        'check_in_lat','check_in_lng','check_out_lat','check_out_lng',
        'is_within_geofence','method','total_hours','late_minutes','status','notes',
    ];
    protected $casts = [
        'check_in_at'=>'datetime','check_out_at'=>'datetime',
        'is_within_geofence'=>'boolean','total_hours'=>'decimal:2',
    ];
    public function employee() { return $this->belongsTo(Employee::class); }
    public function site() { return $this->belongsTo(Site::class); }
    public function shiftSchedule() { return $this->belongsTo(ShiftSchedule::class); }
}
