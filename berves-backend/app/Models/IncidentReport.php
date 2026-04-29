<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class IncidentReport extends Model
{
    protected $fillable = [
        'reported_by','site_id','incident_date','incident_time','type','severity',
        'description','injured_employee_id','injury_description','root_cause',
        'corrective_actions','status','investigated_by','closed_at',
    ];
    protected $casts = ['incident_date'=>'date','closed_at'=>'datetime'];
    public function reportedByEmployee() { return $this->belongsTo(Employee::class, 'reported_by'); }
    public function site() { return $this->belongsTo(Site::class); }
    public function injuredEmployee() { return $this->belongsTo(Employee::class, 'injured_employee_id'); }
    public function investigatedBy() { return $this->belongsTo(User::class, 'investigated_by'); }
    public function attachments() { return $this->hasMany(IncidentAttachment::class, 'incident_id'); }
}
