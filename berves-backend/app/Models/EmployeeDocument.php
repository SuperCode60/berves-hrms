<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class EmployeeDocument extends Model
{
    protected $fillable = [
        'employee_id','document_type','document_name','file_path',
        'issue_date','expiry_date','is_verified','uploaded_by',
    ];
    protected $casts = ['issue_date'=>'date','expiry_date'=>'date','is_verified'=>'boolean'];
    public function employee() { return $this->belongsTo(Employee::class); }
    public function uploader() { return $this->belongsTo(User::class, 'uploaded_by'); }
}
