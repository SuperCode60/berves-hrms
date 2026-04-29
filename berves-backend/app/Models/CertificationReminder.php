<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CertificationReminder extends Model {
    public $timestamps = false;
    protected $fillable = ['enrollment_id','reminder_type','sent_at','channel'];
    protected $casts = ['sent_at'=>'datetime'];
    public function enrollment() { return $this->belongsTo(TrainingEnrollment::class,'enrollment_id'); }
}