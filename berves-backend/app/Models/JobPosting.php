<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class JobPosting extends Model
{
    protected $fillable = [
        'job_title_id','department_id','site_id','description','requirements',
        'employment_type','salary_min','salary_max','deadline','status','posted_by',
    ];
    protected $casts = ['deadline'=>'date','salary_min'=>'decimal:2','salary_max'=>'decimal:2'];
    public function jobTitle() { return $this->belongsTo(JobTitle::class); }
    public function department() { return $this->belongsTo(Department::class); }
    public function site() { return $this->belongsTo(Site::class); }
    public function postedBy() { return $this->belongsTo(User::class, 'posted_by'); }
    public function applicants() { return $this->hasMany(Applicant::class); }
    public function getApplicantsCountAttribute(): int { return $this->applicants()->count(); }
}
