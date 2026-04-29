<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class SafetyInspection extends Model
{
    protected $fillable = [
        'site_id','inspector_id','inspection_date','findings','risk_level',
        'follow_up_required','follow_up_date','status',
    ];
    protected $casts = ['inspection_date'=>'date','follow_up_date'=>'date','follow_up_required'=>'boolean'];
    public function site() { return $this->belongsTo(Site::class); }
    public function inspector() { return $this->belongsTo(Employee::class, 'inspector_id'); }
}
