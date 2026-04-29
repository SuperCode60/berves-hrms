<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class EmployeeAllowance extends Model
{
    protected $fillable = ['employee_id','allowance_type','amount','is_taxable','effective_from','effective_to'];
    protected $casts = ['is_taxable'=>'boolean','effective_from'=>'date','effective_to'=>'date','amount'=>'decimal:2'];
    public function employee() { return $this->belongsTo(Employee::class); }
}
