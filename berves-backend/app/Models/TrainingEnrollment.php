<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class TrainingEnrollment extends Model
{
    protected $fillable = [
        'employee_id','training_program_id','scheduled_date','completed_date',
        'status','score','expiry_date','certificate_path',
    ];
    protected $casts = ['scheduled_date'=>'date','completed_date'=>'date','expiry_date'=>'date','score'=>'decimal:2'];
    public function employee() { return $this->belongsTo(Employee::class); }
    public function trainingProgram() { return $this->belongsTo(TrainingProgram::class); }
}
