<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ShiftTemplate extends Model
{
    protected $fillable = ['name','start_time','end_time','break_minutes','type'];
    public function schedules() { return $this->hasMany(ShiftSchedule::class); }
}
