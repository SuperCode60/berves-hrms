<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Applicant extends Model
{
    const UPDATED_AT = null;
    protected $fillable = ['job_posting_id','full_name','email','phone','cv_path','cover_letter','status','applied_at'];
    protected $casts = ['applied_at'=>'datetime'];
    public function jobPosting() { return $this->belongsTo(JobPosting::class); }
    public function interviews() { return $this->hasMany(InterviewSchedule::class); }
}
