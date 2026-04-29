<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class InterviewSchedule extends Model
{
    protected $fillable = ['applicant_id','scheduled_at','location','interview_type','interviewers','status','notes'];
    protected $casts = ['scheduled_at'=>'datetime','interviewers'=>'array'];
    public function applicant() { return $this->belongsTo(Applicant::class); }
    public function evaluations() { return $this->hasMany(InterviewEvaluation::class); }
}
