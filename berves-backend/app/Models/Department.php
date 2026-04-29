<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Department extends Model
{
    protected $fillable = ['name','manager_id','site_id'];
    public function manager() { return $this->belongsTo(Employee::class, 'manager_id'); }
    public function site() { return $this->belongsTo(Site::class); }
    public function employees() { return $this->hasMany(Employee::class); }
    public function jobTitles() { return $this->hasMany(JobTitle::class); }
}
