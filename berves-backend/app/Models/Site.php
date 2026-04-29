<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Site extends Model
{
    protected $fillable = ['name','location','latitude','longitude','geo_fence_radius_m','is_active'];
    protected $casts = ['is_active'=>'boolean','latitude'=>'decimal:7','longitude'=>'decimal:7'];
    public function employees() { return $this->hasMany(Employee::class); }
    public function shiftSchedules() { return $this->hasMany(ShiftSchedule::class); }
}
