<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class InterviewEvaluation extends Model
{
    protected $fillable = ['interview_schedule_id','interviewer_id','score','recommendation','comments'];
    public function interview() { return $this->belongsTo(InterviewSchedule::class, 'interview_schedule_id'); }
    public function interviewer() { return $this->belongsTo(User::class, 'interviewer_id'); }
}
