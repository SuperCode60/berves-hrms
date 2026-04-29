<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class EmployeeOnboarding extends Model
{
    public $timestamps = false;
    protected $fillable = ['employee_id','checklist_id','status','completed_at','safety_induction_done','notes'];
    protected $casts = ['completed_at'=>'datetime','safety_induction_done'=>'boolean'];
    public function employee() { return $this->belongsTo(Employee::class); }
    public function checklist() { return $this->belongsTo(OnboardingChecklist::class); }
}
