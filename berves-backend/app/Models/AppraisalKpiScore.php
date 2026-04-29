<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AppraisalKpiScore extends Model
{
    public $timestamps = false;
    protected $fillable = ['appraisal_id','kpi_id','target_value','actual_value','score','comments'];
    protected $casts = ['target_value'=>'decimal:2','actual_value'=>'decimal:2','score'=>'decimal:2'];
    public function appraisal() { return $this->belongsTo(EmployeeAppraisal::class); }
    public function kpi() { return $this->belongsTo(KpiDefinition::class); }
}
