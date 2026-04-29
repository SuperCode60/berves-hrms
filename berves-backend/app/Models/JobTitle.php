<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class JobTitle extends Model
{
    public $timestamps = false;
    protected $fillable = ['title','grade','department_id'];
    public function department() { return $this->belongsTo(Department::class); }
    public function employees() { return $this->hasMany(Employee::class); }
}
