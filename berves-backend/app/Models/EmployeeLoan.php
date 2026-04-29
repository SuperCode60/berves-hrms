<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class EmployeeLoan extends Model
{
    protected $fillable = [
        'employee_id','principal','interest_rate','monthly_deduction',
        'balance_remaining','disbursed_on','status','approved_by',
    ];
    protected $casts = ['principal'=>'decimal:2','monthly_deduction'=>'decimal:2','balance_remaining'=>'decimal:2','disbursed_on'=>'date'];
    public function employee() { return $this->belongsTo(Employee::class); }
    public function approvedBy() { return $this->belongsTo(User::class, 'approved_by'); }
}
