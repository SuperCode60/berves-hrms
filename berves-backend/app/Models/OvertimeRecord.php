<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OvertimeRecord extends Model
{
    protected $fillable = [
        'employee_id','date','day_type','hours','rate_multiplier',
        'hourly_rate','amount','approved_by','payroll_run_id',
    ];
    protected $casts = ['date'=>'date','hours'=>'decimal:2','rate_multiplier'=>'decimal:2','amount'=>'decimal:2'];
    public function employee() { return $this->belongsTo(Employee::class); }
    public function approvedBy() { return $this->belongsTo(User::class, 'approved_by'); }
    public function payrollRun() { return $this->belongsTo(PayrollRun::class); }
}
