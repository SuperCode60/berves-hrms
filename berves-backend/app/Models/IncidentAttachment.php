<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class IncidentAttachment extends Model
{
    public $timestamps = false;
    protected $fillable = ['incident_id','file_path','file_type','uploaded_by'];
    public function incident() { return $this->belongsTo(IncidentReport::class); }
    public function uploader() { return $this->belongsTo(User::class, 'uploaded_by'); }
}
