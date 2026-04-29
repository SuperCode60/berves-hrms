<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class TrainingProgram extends Model
{
    protected $fillable = ['name','description','provider','duration_hours','is_mandatory','recurrence_months'];
    protected $casts = ['is_mandatory'=>'boolean'];
    public function enrollments() { return $this->hasMany(TrainingEnrollment::class); }
}
