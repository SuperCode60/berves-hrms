<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PayrollAllowanceLine extends Model
{
    public $timestamps = false;
    protected $fillable = ['payroll_run_id','allowance_type','amount','is_taxable'];
    protected $casts = ['amount'=>'decimal:2','is_taxable'=>'boolean'];
    public function payrollRun() { return $this->belongsTo(PayrollRun::class); }
}
