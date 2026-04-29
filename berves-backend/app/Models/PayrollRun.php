<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PayrollRun extends Model
{
    protected $fillable = [
        'payroll_period_id','employee_id','basic_salary','total_allowances','overtime_pay',
        'gross_pay','tax_deduction','ssnit_employee','ssnit_employer','loan_deduction',
        'other_deductions','total_deductions','net_pay','payment_status','payment_date','payslip_path',
    ];
    protected $casts = [
        'basic_salary'=>'decimal:2','total_allowances'=>'decimal:2','overtime_pay'=>'decimal:2',
        'gross_pay'=>'decimal:2','tax_deduction'=>'decimal:2','ssnit_employee'=>'decimal:2',
        'ssnit_employer'=>'decimal:2','loan_deduction'=>'decimal:2','other_deductions'=>'decimal:2',
        'total_deductions'=>'decimal:2','net_pay'=>'decimal:2','payment_date'=>'date',
    ];
    public function period() { return $this->belongsTo(PayrollPeriod::class, 'payroll_period_id'); }
    public function employee() { return $this->belongsTo(Employee::class); }
    public function allowanceLines() { return $this->hasMany(PayrollAllowanceLine::class); }
    public function overtimeRecords() { return $this->hasMany(OvertimeRecord::class); }
}
