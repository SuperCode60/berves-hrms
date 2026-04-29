<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LeaveEntitlement extends Model
{
    public $timestamps = false;
    protected $fillable = ['employee_id','leave_type_id','year','entitled_days','used_days','carried_over'];
    protected $casts = ['entitled_days'=>'decimal:1','used_days'=>'decimal:1','carried_over'=>'decimal:1'];
    public function employee() { return $this->belongsTo(Employee::class); }
    public function leaveType() { return $this->belongsTo(LeaveType::class); }
    public function getRemainingDaysAttribute(): float
    {
        return $this->entitled_days + $this->carried_over - $this->used_days;
    }
}
