<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LeavePolicy extends Model
{
    protected $fillable = [
        'leave_type_id',
        'max_consecutive_days', 
        'min_service_months',
        'allow_half_day',
        'effective_from'
    ];
    
    protected $casts = [
        'allow_half_day' => 'boolean',
        'effective_from' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
    
    public function leaveType() { 
        return $this->belongsTo(LeaveType::class); 
    }
    
    public function entitlements()
    {
        return $this->hasMany(LeaveEntitlement::class, 'leave_type_id', 'leave_type_id');
    }
}
