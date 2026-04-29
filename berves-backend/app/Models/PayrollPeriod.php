<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PayrollPeriod extends Model
{
    protected $fillable = [
        'period_name','start_date','end_date','status',
        'processed_by','approved_by','processed_at','approved_at',
    ];
    protected $casts = [
        'start_date'=>'date','end_date'=>'date',
        'processed_at'=>'datetime','approved_at'=>'datetime',
    ];
    public function runs() { return $this->hasMany(PayrollRun::class); }
    public function processedBy() { return $this->belongsTo(User::class, 'processed_by'); }
    public function approvedBy() { return $this->belongsTo(User::class, 'approved_by'); }
}
