<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LeaveType extends Model
{
    protected $fillable = ['name','days_per_year','is_paid','requires_approval','carry_over_days','notice_days'];
    protected $casts = ['is_paid'=>'boolean','requires_approval'=>'boolean'];
    public function entitlements() { return $this->hasMany(LeaveEntitlement::class); }
    public function requests() { return $this->hasMany(LeaveRequest::class); }
}
