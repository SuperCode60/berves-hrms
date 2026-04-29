<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PublicHoliday extends Model
{
    public $timestamps = false;
    protected $fillable = ['name','date','year','site_id'];
    protected $casts = ['date'=>'date'];
    public function site() { return $this->belongsTo(Site::class); }
}
