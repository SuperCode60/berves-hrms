<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class EmployeeAppraisal extends Model
{
    protected $fillable = [
        'employee_id','appraiser_id','appraisal_cycle_id','overall_score',
        'status','employee_comment','appraiser_comment',
    ];
    protected $casts = ['overall_score'=>'decimal:2'];
    public function employee() { return $this->belongsTo(Employee::class); }
    public function appraiser() { return $this->belongsTo(Employee::class, 'appraiser_id'); }
    public function appraisalCycle() { return $this->belongsTo(AppraisalCycle::class); }
    public function kpiScores() { return $this->hasMany(AppraisalKpiScore::class, 'appraisal_id'); }
}
