<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OffDayRequest extends Model
{
    protected $fillable = [
        'employee_id','start_date','end_date','days_count','reason','status',
        'reviewed_by','reviewed_at','has_schedule_conflict',
    ];
    protected $casts = [
        'start_date'            => 'date',
        'end_date'              => 'date',
        'reviewed_at'           => 'datetime',
        'has_schedule_conflict' => 'boolean',
    ];
    public function employee() { return $this->belongsTo(Employee::class); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewed_by'); }
}
