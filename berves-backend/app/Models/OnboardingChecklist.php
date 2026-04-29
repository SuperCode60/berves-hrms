<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OnboardingChecklist extends Model
{
    public $timestamps = false;
    protected $fillable = ['name','category','is_mandatory','due_days_after_hire'];
    protected $casts = ['is_mandatory'=>'boolean'];
}
